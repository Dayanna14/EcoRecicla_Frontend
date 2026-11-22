import { Routes } from '@angular/router';
import { Rolcomponent } from './components/rolcomponent/rolcomponent';
import { Rollistcomponent } from './components/rolcomponent/rollistcomponent/rollistcomponent';
import { Rolinsertcomponent } from './components/rolcomponent/rolinsertcomponent/rolinsertcomponent';
import { Centroacopiocomponent } from './components/centroacopiocomponent/centroacopiocomponent';
import { Centroacopiolistcomponent } from './components/centroacopiocomponent/centroacopiolistcomponent/centroacopiolistcomponent';
import { Centroacopioinsertcomponent } from './components/centroacopiocomponent/centroacopioinsertcomponent/centroacopioinsertcomponent';
import { Mapacentroscomponent } from './components/centroacopiocomponent/mapacentroscomponent/mapacentroscomponent';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Canjelistcomponent } from './components/canjecomponent/canjelistcomponent/canjelistcomponent';
import { Canjeinsertcomponent } from './components/canjecomponent/canjeinsertcomponent/canjeinsertcomponent';
import { Canjecomponent } from './components/canjecomponent/canjecomponent';

export const routes: Routes = [
        // ---------- General ----------
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Homecomponent },
    
        // ---------- Dayana: Roles ----------
    {
        path: 'roles',
        component: Rolcomponent,
        children: [
            { path: 'listar', component: Rollistcomponent },
            { path: 'insertar', component: Rolinsertcomponent },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    },

    // ---------- Dayana: Centros de acopio ----------
    {
        path: 'centrosacopio',
        component: Centroacopiocomponent,
        children: [
            { path: 'listar', component: Centroacopiolistcomponent },
            { path: 'insertar', component: Centroacopioinsertcomponent },
            { path: 'mapa', component: Mapacentroscomponent },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    },

    // ---------- Nayara: usuarios, recompensas ----------

    // ---------- Axel: tiporecompensas, materiales ----------

    // ---------- Jhon: entregas ----------

    // ---------- Franco: canjes ----------
    {
        path: 'canjes',
        component: Canjecomponent,
        children: [
            { path: 'listar', component: Canjelistcomponent},
            { path: 'insertar', component: Canjeinsertcomponent}, 
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    }

];
