import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateAfter(autreChamp: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valeurAutre = control.parent?.get(autreChamp)?.value;
    const valeurSelf  = control.value;

    // Pas de vérification si l'un des deux est vide
    if (!valeurAutre || !valeurSelf) return null;

    return new Date(valeurSelf) >= new Date(valeurAutre)
      ? null
      : { dateInvalide: true };
  };
}

  export function dateNotInPast(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valeur = control.value;
    if (!valeur) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);   // minuit pour comparer des jours

    const date = new Date(valeur);
    date.setHours(0, 0, 0, 0);

    return date >= today ? null : { datePassee: true };
  };
}