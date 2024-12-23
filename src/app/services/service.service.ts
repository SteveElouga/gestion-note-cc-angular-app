import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, catchError, finalize, map, Observable, of, tap, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {EvaluationModel} from '../models/evaluation.model';
import {UserModel} from '../models/user.model';
import {LoginModel} from '../models/login.model';
import {UpdateModele} from '../models/update.modele';
import {MatiereModel, MatiereModelAdd} from '../models/matiere.model';
import {EnseignantModel} from '../models/enseignant.model';
import {AddEvaluationModel} from '../models/addEvaluation.model';
import {NoteModel} from '../models/note.model';
import {AddNoteModel} from '../models/addNote.model';
import {PasswordUpdateModele} from '../models/passwordUpdate.modele';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  apiUrl = "http://127.0.0.1:5000/api/auth/"
  apiUrlNote = "http://127.0.0.1:5000/api/notes"
  apiUrlUser = "http://127.0.0.1:5000/api/users"
  private isFuture!: boolean;
  private _notesGlobales$ = new BehaviorSubject<{id: number, note: number, matiere: string}[]>([]);


  constructor(private http: HttpClient, private route: Router, private cookie: CookieService) {
  }

  private _currentUser$ = new BehaviorSubject<{ username: string, email: string }>({username: "", email: ""})
  user = new UserModel()
  private _user$ = new BehaviorSubject<UserModel>(this.user)
  private _userOnUpdate$ = new BehaviorSubject<UserModel>(this.user)
  private _usersList$ = new BehaviorSubject<UserModel[]>([this.user])

  private _loader$ = new BehaviorSubject<boolean>(false);
  private _smallErrorMsg$ = new BehaviorSubject<boolean>(false);
  private _evaluations$ = new BehaviorSubject<EvaluationModel[]>([]);
  private _matieres$ = new BehaviorSubject<MatiereModel[]>([]);
  private _filieres$ = new BehaviorSubject<string[]>([]);
  private _departement$ = new BehaviorSubject<string[]>([]);
  private _enseignants$ = new BehaviorSubject<EnseignantModel[]>([]);
  _notes$ = new BehaviorSubject<NoteModel[]>([]);
  private _displayedColumns$ = new BehaviorSubject<string[]>([])
  private _displayedColumnsMatiere$ = new BehaviorSubject<string[]>([])
  private _create$ = new BehaviorSubject<boolean>(false);
  private _statNote$ = new BehaviorSubject<{ matiere: string, max: number, min: number, moy: number }[]>([]);
  private _matriculeNote$ = new BehaviorSubject('')


  private _errorNoteAdd$ = new BehaviorSubject<string>('')

  private _userInfos$ = new BehaviorSubject<UserModel>(this.user);


  get matriculeNote$(){
    return this._matriculeNote$.asObservable()
  }
  get statNote$(): Observable<{ matiere: string, max: number, min: number, moy: number }[]> {
    return this._statNote$.asObservable()
  }

  get notesGlobales$(): Observable<{id: number, note: number, matiere: string}[]> {
    return this._notesGlobales$.asObservable()
  }

  get evaluation$(): Observable<EvaluationModel[]> {
    return this._evaluations$.asObservable();
  }

  get note$(): Observable<NoteModel[]> {
    return this._notes$.asObservable();
  }

  get matieres$(): Observable<MatiereModel[]> {
    return this._matieres$.asObservable();
  }

  get filieres$(): Observable<string[]> {
    return this._filieres$.asObservable();
  }

  get departement$(): Observable<string[]> {
    return this._departement$.asObservable();
  }

  get enseignant$(): Observable<EnseignantModel[]> {
    return this._enseignants$.asObservable();
  }

  get displayedColumns$(): Observable<string[]> {
    return this._displayedColumns$.asObservable();
  }

  get errorNoteAdd$(): Observable<string> {
    return this._errorNoteAdd$.asObservable();
  }

  get displayedColumnsMatiere$(): Observable<string[]> {
    return this._displayedColumnsMatiere$.asObservable();
  }


  get userInfos$(): Observable<UserModel> {
    return this._userInfos$.asObservable();
  }

  get loader$(): Observable<boolean> {
    return this._loader$.asObservable();
  }

  get create$(): Observable<boolean> {
    return this._create$.asObservable();
  }

  get smallErrorMsg$(): Observable<boolean> {
    return this._smallErrorMsg$.asObservable()
  }

  setLoader(value: boolean) {
    this._loader$.next(value)
  }

  setSmallErrorMsg(value: boolean) {
    this._smallErrorMsg$.next(true)
  }

  get currentUser$() {
    return this._currentUser$.asObservable()
  }

  get user$() {
    return this._user$.asObservable()
  }

  get userOnUpdate$() {
    return this._userOnUpdate$.asObservable()
  }

  get userList$() {
    return this._usersList$.asObservable()
  }


  login(value: LoginModel) {
    this._loader$.next(true);
    this.http.post<{
      access_token: string;
      message: string;
      refresh_token: string;
      status: boolean;
    }>(this.apiUrl + 'login', value, {withCredentials: true}).pipe(
      tap((response) => {
        // Stockage sécurisé des tokens
        this.cookie.set('access_token', response.access_token, 10, '/', undefined, true, 'Strict');
        this.cookie.set('refresh_token', response.refresh_token, 30, '/refresh', undefined, true, 'Strict');

        // Redirection en fonction du statut
        const targetRoute = response.status ? 'dashboard' : 'complete-infos';
        this.route.navigateByUrl(targetRoute);

        // Réinitialisation des états
        this._loader$.next(false);
        this._smallErrorMsg$.next(false);
      }),
      catchError((error) => {
        console.error('Erreur de connexion :', error);
        this._loader$.next(false);
        this._smallErrorMsg$.next(true); // Affiche un message d'erreur si nécessaire
        return of(null); // Retourne une valeur neutre pour éviter un crash
      })
    ).subscribe();
  }

  update(data: PasswordUpdateModele | UpdateModele) {
    this._loader$.next(true);
    const token = this.cookie.get('access_token');

    if (!token) {
      console.error('Token d\'accès manquant');
      this._loader$.next(false);
      this._smallErrorMsg$.next(true);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<{message: string, verified: boolean}>(this.apiUrl + 'update', data, {headers}).pipe(
      tap(() => {
        this.route.navigateByUrl('dashboard');
        this._loader$.next(false);
        this._smallErrorMsg$.next(false);
      }),
      map(response => { // On ajoute le map pour renvoyer la réponse du server
        return response;
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour :', error);
        this._loader$.next(false);
        this._smallErrorMsg$.next(true); // Affiche un message d'erreur si besoin
        return of(null); // Évite un crash de l'observable
      })
    )
  }

  logout() {
    const token = this.cookie.get('access_token');

    if (!token) {
      console.warn('Utilisateur déjà déconnecté ou token manquant');
      this.cookie.delete('access_token');
      this.cookie.delete('refresh_token');
      this.route.navigateByUrl('');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ message: string }>(this.apiUrl + "logout", {headers}).pipe(
      tap(() => {
        // Suppression sécurisée des tokens
        this.cookie.delete('access_token');
        this.cookie.delete('refresh_token');

        // Redirection vers la page d'accueil
        this.route.navigateByUrl('');
      }),
      catchError((error) => {
        console.error('Erreur lors de la déconnexion :', error);
        // Supprime les cookies même en cas d'erreur
        this.cookie.delete('access_token');
        this.cookie.delete('refresh_token');
        this.route.navigateByUrl(''); // Redirige malgré tout
        return of(null); // Empêche un crash
      })
    ).subscribe();
  }

  whoami() {
    this._loader$.next(true);
    const token = this.cookie.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{ user: UserModel }>(this.apiUrl + "whoami", {headers}).pipe(
      tap((response) => {
        this._userInfos$.next(response.user);
        this._user$.next(response.user);
        this._loader$.next(false);

        if (response.user.role === 'teacher' || response.user.role === 'admin') {
          this._create$.next(true)
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des informations utilisateur :', error);
        this._loader$.next(false);
        return of(null); // Retourne une valeur vide pour éviter un crash de l'observable
      })
    ).subscribe();
  }


  evaluations() {
    this._loader$.next(true);
    const token = this.cookie.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{
      evaluations: EvaluationModel[],
      action: boolean
    }>(this.apiUrlNote + "/get/evaluations", {headers}).pipe(
      tap((response) => {
        const evaluations = response.evaluations || [];

        // Configuration des colonnes
        if (evaluations.length > 0 && evaluations[0].action) {
          this._displayedColumns$.next(['id', 'date', 'heure', 'intitule', 'filiere', 'enseignant', 'update_at', 'actions']);
          this._create$.next(true);
        } else {
          this._displayedColumns$.next(['id', 'date', 'heure', 'intitule', 'filiere', 'enseignant', 'update_at']);
        }
        if (response.action) {
          this._create$.next(true);
        }
        // Tri des évaluations par date décroissante
        const sortedEvaluations = evaluations.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // Ajout de la propriété isFuture sans modifier l'objet original
        const evaluationsWithFutureFlag = sortedEvaluations.map((evaluation) => ({
          ...evaluation,
          isFuture: new Date(evaluation.date) > new Date(),
        }));

        this._evaluations$.next(evaluationsWithFutureFlag);
        this._loader$.next(false);
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des évaluations :', error.error);
        this._loader$.next(false);
        this._create$.next(error.error.action);
        return of([]); // Retourne un tableau vide pour éviter un crash
      })
    ).subscribe();
  }

  note() {
    this._loader$.next(true);
    const token = this.cookie.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{ notes: NoteModel[], note_filiere: {id: number, note: number, matiere: string}[], student: boolean }>(this.apiUrlNote + "/get/notes", {headers}).pipe(
      tap((response) => {
        // Vérifiez si le tableau de notes existe et n'est pas vide
        if (!response.notes || response.notes.length === 0) {
          this._notes$.next([]);
          this._statNote$.next([]);
          this._displayedColumns$.next(['code', 'matiere', 'note', 'matricule', 'nom', 'filiere', 'enseignant', 'update_at']);
          this._loader$.next(false);
          return;
        }


        // Configuration des colonnes
        const firstNote = response.notes[0];
        // Tri des notes
        const sortedNotes = response.notes.sort((a, b) => b.note - a.note);
        if (firstNote.action) {
          this._displayedColumns$.next(['code', 'matiere', 'note', 'matricule', 'nom', 'filiere', 'enseignant', 'update_at', 'actions']);
          this._create$.next(true);

          this._notes$.next(sortedNotes);
        } else {
          this._notesGlobales$.next(response.note_filiere)
          this._displayedColumns$.next(['code', 'matiere', 'note', 'matricule', 'nom', 'filiere', 'enseignant', 'update_at']);
        }




        const sortedNotesFiliereStudent = response.note_filiere.sort((a, b) => b.note - a.note);

        console.log(response.note_filiere)

        // Calcul des statistiques par matière
        const notesBySubject = sortedNotes.reduce((acc, note) => {
          const subject = note.matiere; // Assurez-vous que `matiere` correspond bien
          if (!acc[subject]) acc[subject] = [];
          acc[subject].push(note.note);
          return acc;
        }, {} as Record<string, number[]>);

        const notesFiliereStudentBySubject = sortedNotesFiliereStudent.reduce((acc, note) => {
          const subject = note.matiere; // Assurez-vous que `matiere` correspond bien
          if (!acc[subject]) acc[subject] = [];
          acc[subject].push(note.note);
          return acc;
        }, {} as Record<string, number[]>);

        const subjectStats = Object.keys(notesBySubject).map(subject => {
          const notes = notesBySubject[subject];
          return {
            matiere: subject,
            max: Math.max(...notes),
            min: Math.min(...notes),
            moy: notes.reduce((sum, note) => sum + note, 0) / notes.length,
          };
        });

        const subjectStatsStudent = Object.keys(notesFiliereStudentBySubject).map(subject => {
          const notes = notesFiliereStudentBySubject[subject];
          return {
            matiere: subject,
            max: Math.max(...notes),
            min: Math.min(...notes),
            moy: notes.reduce((sum, note) => sum + note, 0) / notes.length,
          };
        });

        // Tri des statistiques par matière
        const sortedStats = subjectStats.sort((a, b) => a.matiere.localeCompare(b.matiere));

        const sortedStatsFiliereStudent = subjectStatsStudent.sort((a, b) => a.matiere.localeCompare(b.matiere));

        if(response.student){
          console.log(response.student, sortedStatsFiliereStudent)
          this._statNote$.next(sortedStatsFiliereStudent);
        }
        else{
          this._statNote$.next(sortedStats);
        }

        // Masquer le loader
        this._loader$.next(false);
      })
    ).subscribe({
      next: () => console.log("Chargement des données réussi."),
      error: (err) => {
        console.error('Erreur lors de la récupération des données : ', err);
        this._loader$.next(false); // Assurez-vous de masquer le loader en cas d'erreur
      },
    });
  }

  matieres() {
    this._loader$.next(true);
    const token = this.cookie.get('access_token');

    if (!token) {
      console.error('Token d\'accès manquant');
      this._loader$.next(false);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ matieres: MatiereModel[], action: string }>(this.apiUrlNote + "/get/matieres", {headers}).pipe(
      tap((response) => {
        // console.log(response.matieres);

        // Mise à jour des colonnes affichées
        const columns = ['code', 'intitule', 'credits', 'enseignant', 'update_at'];
        if (response.action) {
          columns.push('actions');
          this._create$.next(true);
        } else {
          this._create$.next(false);
        }
        this._displayedColumnsMatiere$.next(columns);

        // Tri et mise à jour des données
        const sortedMatieres = response.matieres.sort((a, b) => {
          return new Date(b.update_at).getTime() - new Date(a.update_at).getTime();
        })
        this._matieres$.next(sortedMatieres);

        this._loader$.next(false);
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des matières :', error);
        this._loader$.next(false);
        return of(null);
      })
    ).subscribe();
  }

  allUser() {
    this._loader$.next(true);
    const token = this.cookie.get('access_token');

    if (!token) {
      console.error('Token d\'accès manquant');
      this._loader$.next(false);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ users: UserModel[], action: string }>(this.apiUrlUser + "/all", {headers}).pipe(
      tap((response) => {

        // Mise à jour des colonnes affichées
        let columns = ['matricule', 'noms', 'prenoms', 'tel', 'email', 'role', 'status', 'password', 'update'];
        if (response.action) {
          columns.push('actions');
          this._create$.next(true);
        }
        this._displayedColumnsMatiere$.next(columns);

        // Tri et mise à jour des données
        const sortedUsers = response.users.sort((a, b) => {
          return new Date(b.update_at).getTime() - new Date(a.update_at).getTime();
        })

        this._usersList$.next(sortedUsers);

        this._loader$.next(false);
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        this._loader$.next(false);
        return of(null);
      })
    ).subscribe();
  }

  filieres() {
    this._loader$.next(true);
    const token = this.cookie.get('access_token');

    if (!token) {
      console.error('Token d\'accès manquant');
      this._loader$.next(false);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<{ filieres: string[], departements: string[] }>(this.apiUrlNote + "/get/filieres", {headers}).pipe(
      tap((response) => {
        // Tri des données
        const sortedFilieres = response.filieres.sort();
        const sortedDepartements = response.departements.sort();

        // Mise à jour des observables
        this._filieres$.next(sortedFilieres);
        this._departement$.next(sortedDepartements);

        this._loader$.next(false);
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des filières :', error);
        this._loader$.next(false);
        return of(null);
      })
    ).subscribe();
  }


  enseignants() {
    const token = this.cookie.get('access_token')
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    this.http.get<{ teachers: EnseignantModel[] }>(this.apiUrlUser + "/all/teachers", {headers}).pipe(
      tap((response) => {
        this._enseignants$.next(response.teachers)
      })
    ).subscribe()
  }

  deleteEvaluation(id: number) {
    return this.http.get(this.apiUrlNote + `/delete/evaluations/${id}`).pipe(
      tap(() => {
        this.evaluations()
      })
    )
  }

  deleteNote(id: number) {
    return this.http.get(this.apiUrlNote + `/delete/notes/${id}`).pipe(
      tap(() => {
        this.note()
      })
    )
  }

  addNote(data: AddNoteModel) {
    this._errorNoteAdd$.next('');
    return this.http.post(this.apiUrlNote + '/add/note', data).pipe(
      tap(() => {
        this._matriculeNote$.next(data.matricule)
        // Appel de la méthode "note" uniquement si la requête réussit
        this.note();
        // this._errorNoteAdd$.next('');
      }),
      catchError((error) => {
        // En cas d'erreur, publier un message dans `_errorNoteAdd$`
        this._errorNoteAdd$.next(`Une erreur s'est produite.`);
        return throwError(() => new Error(error.message)); // Propagation de l'erreur si nécessaire
      })
    );
  }

  addEvaluation(data: AddEvaluationModel) {
    this._loader$.next(true);
    return this.http.post(this.apiUrlNote + '/add/evaluation', data).pipe(
      tap(() => {
        console.log('Évaluation ajoutée avec succès.');
        this.evaluations();
      }),
      catchError((error) => {
        console.error('Erreur lors de l\'ajout de l\'évaluation :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    );
  }


  updateEvaluation(id: number, data: AddEvaluationModel) {
    this._loader$.next(true);
    return this.http.patch(this.apiUrlNote + `/update/evaluation/${id}`, data).pipe(
      tap(() => {
        console.log('Évaluation mise à jour avec succès.', data);
        this.evaluations();
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour de l\'évaluation :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    );
  }


  updateNote(id: number, data: AddNoteModel) {
    this._loader$.next(true);
    return this.http.patch(this.apiUrlNote + `/update/note/${id}`, data).pipe(
      tap(() => {
        console.log('Note mise à jour avec succès.', data);
        this.note();
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour de la note :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    );
  }

  updateUser(id: number, data: UserModel) {
    this._loader$.next(true);
    return this.http.patch(this.apiUrl + `update/${id}`, data).pipe(
      tap(() => {
        console.log('Utilisateur mise à jour avec succès.', data);
        this.allUser();
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    );
  }

  getUserById(id: number) {
    this._loader$.next(true);
    this.http.get<{ user: UserModel }>(this.apiUrlUser + `/${id}`).pipe(
      tap((res) => {
        this._userOnUpdate$.next(res.user)
      }),
      catchError((error) => {
        console.error('Erreur lors de la recuperation de l\'utilisateur :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    ).subscribe();
  }

  deleteMatiere(id: number) {
    this._loader$.next(true);
    return this.http.get(this.apiUrlNote + `/delete/matiere/${id}`).pipe(
      tap(() => {
        console.log(`Matière avec l'ID ${id} supprimée.`);
        this.matieres();
      }),
      catchError((error) => {
        console.error('Erreur lors de la suppression de la matière :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    )
  }


  updateMatiere(id: number, data: MatiereModelAdd) {
    this._loader$.next(true);
    return this.http.patch(this.apiUrlNote + `/update/matiere/${id}`, data).pipe(
      tap(() => {
        console.log('Matière mise à jour avec succès.', data);
        this.matieres();
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour de la matière :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    );
  }


  createUser(data: { filiere: string; role: string; departement: string; matricule: string }) {
    this._loader$.next(true);
    return this.http.post(this.apiUrl + "register", data).pipe(
      tap(() => {
        console.log('Utilisateur créé avec succès.', data);
        this.route.navigateByUrl('userlist');
      }),
      catchError((error) => {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    );
  }

  addMatiere(data: MatiereModelAdd) {
    return this.http.post(this.apiUrlNote + '/add/matiere', data).pipe(
      tap(() => {
        console.log('Matiere ajoutée avec succès.');
        this.matieres()
      }),
      catchError((error) => {
        console.error('Erreur lors de l\'ajout de la matiere :', error);
        return throwError(() => new Error(error.message));
      }),
    )
  }

  deleteUser(idUser: number) {
    this._loader$.next(true);
    return this.http.delete(this.apiUrlUser + `/delete/${idUser}`).pipe(
      tap(() => {
        console.log(`L'utilisateur avec l'ID ${idUser} supprimée.`);
        this.allUser();
      }),
      catchError((error) => {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        return throwError(() => new Error(error.message));
      }),
      finalize(() => this._loader$.next(false))
    )
  }

  uploadFile(formData: FormData) {
    this._loader$.next(true)
    return this.http.post(this.apiUrl + "register-excel", formData).pipe(
      tap(()=> {
        this._loader$.next(false)
      })
    )
  }

  uploadNotesFromExcel(formData: FormData){
    this._loader$.next(true)
    return this.http.post(this.apiUrlNote + '/add/notes/excel', formData).pipe(
      tap(()=>{
        this.note()
      })
    );
  }

  exportNotes() {
    this._loader$.next(true)
    return this.http.get(this.apiUrlNote + '/export/notes', { responseType: 'blob' })
  }
}
