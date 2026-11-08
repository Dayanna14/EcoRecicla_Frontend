import { Routes } from '@angular/router';
import { Rolcomponent } from './components/rolcomponent/rolcomponent';
import { Rollistcomponent } from './components/rolcomponent/rollistcomponent/rollistcomponent';
import { Rolinsertcomponent } from './components/rolcomponent/rolinsertcomponent/rolinsertcomponent';
import { Centroacopiocomponent } from './components/centroacopiocomponent/centroacopiocomponent';
import { Centroacopiolistcomponent } from './components/centroacopiocomponent/centroacopiolistcomponent/centroacopiolistcomponent';
import { Centroacopioinsertcomponent } from './components/centroacopiocomponent/centroacopioinsertcomponent/centroacopioinsertcomponent';
import { Mapacentroscomponent } from './components/centroacopiocomponent/mapacentroscomponent/mapacentroscomponent';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Rolupdatecomponent } from './components/rolcomponent/rolupdatecomponent/rolupdatecomponent';
import { Rolbuscarcomponent } from './components/rolcomponent/rolbuscarcomponent/rolbuscarcomponent';
import { Centroacopiobuscarcomponent } from './components/centroacopiocomponent/centroacopiobuscarcomponent/centroacopiobuscarcomponent';
import { Centroacopioupdatecomponent } from './components/centroacopiocomponent/centroacopioupdatecomponent/centroacopioupdatecomponent';
import { Entregacomponent } from './components/entregacomponent/entregacomponent';
import { Entregalistcomponent } from './components/entregacomponent/entregalistcomponent/entregalistcomponent';
import { Entregainsertcomponent } from './components/entregacomponent/entregainsertcomponent/entregainsertcomponent';
import { Entregaupdatecomponent } from './components/entregacomponent/entregaupdatecomponent/entregaupdatecomponent';
import { Entregabuscarcomponent } from './components/entregacomponent/entregabuscarcomponent/entregabuscarcomponent';

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
            { path: 'editar/:id', component: Rolupdatecomponent },
            { path: 'buscar', component: Rolbuscarcomponent },
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
            { path: 'buscar', component: Centroacopiobuscarcomponent },
            { path: 'editar/:id', component: Centroacopioupdatecomponent },
            { path: 'mapa', component: Mapacentroscomponent },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    },

    // ---------- Nayara: usuarios, recompensas ----------

    // ---------- Axel: tiporecompensas, materiales ----------

    // ---------- Jhon: entregas ----------
    {
        path: 'entregas',
        component: Entregacomponent,
        children: [
            { path: 'listar', component: Entregalistcomponent },
            { path: 'insertar', component: Entregainsertcomponent },
            { path: 'editar/:id', component: Entregaupdatecomponent },
            { path: 'buscar', component: Entregabuscarcomponent },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    }

    // ---------- Franco: canjes ----------
];
