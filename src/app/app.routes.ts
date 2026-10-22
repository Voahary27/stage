import { Routes } from '@angular/router';
import { Login } from './login/login';
import { UserDashboard} from './pages/user-dashboard/user-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Profil } from './pages/profil/profil';
import { DemandesRecues } from './pages/demandes-recues/demandes-recues';
import { GestionUtilisateurs } from './pages/gestion-utilisateurs/gestion-utilisateurs';


export const routes: Routes = [
    { path: '',component: Login},
    {path : 'user-Home',component: UserDashboard},
    {path: 'admin-Home', component: AdminDashboard},
    { path: 'profil',     component: Profil },
    { path: 'profil/:matricule',    component: Profil }, 
     { path: 'demandes-recues',  component: DemandesRecues },
    { path: 'gestion-utilisateurs', component: GestionUtilisateurs },
];
