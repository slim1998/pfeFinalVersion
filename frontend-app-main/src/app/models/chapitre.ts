import { Lesson } from "./lesson"

export interface Chapitre {


    id?          : number
    titre       : string
    ordre       : number
    moduleId : number
    lessons : Lesson []

}

