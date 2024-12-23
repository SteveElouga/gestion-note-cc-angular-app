import {Injectable, OnDestroy} from '@angular/core';
import {ServiceService} from './service.service';
import {HttpClient} from '@angular/common/http';
import {io, Socket} from 'socket.io-client';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private socket!: Socket;
  private unsubscribe$ = new Subject<void>(); // Utilisé pour nettoyer les subscriptions
  constructor(private service: ServiceService, private http: HttpClient) {
    this.socket = io('http://localhost:5000');
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server.');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server.');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error connecting to WebSocket server:', error);
    });
  }

  registerUser(matricule: string): void {
    this.socket.emit('register_user', {matricule})
  }


  listenToNewNotes(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('new_note', (data: any) => {
        console.log("YO")
        observer.next(data);
        console.log('Nouvelle note reçue :', data);
      });

      // Nettoyage lors de l'arrêt de l'observable
      return () => {
        this.socket.off('new_note');
        console.log('Socket désinscrit de l\evenement new_note');
      };
    })
  }

  ngOnDestroy(): void {
    // Libère les ressources lorsque le service est détruit
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.socket.disconnect();
    console.log('Socket déconnectée.');
  }
}
