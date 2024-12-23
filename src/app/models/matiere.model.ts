export class MatiereModel{
  code!: string
  created_at!: Date
  credits!: number
  id!: number
  intitule!: string
  update_at!: Date
  action!: boolean
  create!: boolean
  filiere!: string
  enseignant!: string
  titre!: string
}

export class MatiereModelAdd{
  code!: string
  credits!: number
  intitule!: string
  filiere!: string
  enseignant!: number
}
