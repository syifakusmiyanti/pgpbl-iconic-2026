import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'splashscreen',
    loadChildren: () =>
      import('./splashscreen/splashscreen.module').then(
        m => m.SplashscreenPageModule
      )
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then(
        m => m.LoginPageModule
      )
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./register/register.module').then(
        m => m.RegisterPageModule
      )
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(
        m => m.TabsPageModule
      )
  },
  {
    path: '',
    redirectTo: 'splashscreen',
    pathMatch: 'full'
  },  {
    path: 'maps',
    loadChildren: () => import('./maps/maps.module').then( m => m.MapsPageModule)
  },
  {
    path: 'createpoint',
    loadChildren: () => import('./createpoint/createpoint.module').then( m => m.CreatepointPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
