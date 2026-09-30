import { Routes } from '@angular/router';
import { Login } from './login/login';
import { UserDashboard} from './pages/user-dashboard/user-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Component } from '@angular/core';



export const routes: Routes = [
    { path: '',component: Login},
    {path : 'user-Home',component: UserDashboard},
    {path: 'admin-Home', component: AdminDashboard}
];
