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
import { Materialcomponent } from './components/materialcomponent/materialcomponent';
import { Materiallistcomponent } from './components/materialcomponent/materiallistcomponent/materiallistcomponent';
import { Materialinsertcomponent } from './components/materialcomponent/materialinsertcomponent/materialinsertcomponent';
import { Materialupdatecomponent } from './components/materialcomponent/materialupdatecomponent/materialupdatecomponent';
import { Materialbuscarcomponent } from './components/materialcomponent/materialbuscarcomponent/materialbuscarcomponent';
import { Materialclasificarcomponent } from './components/materialcomponent/materialclasificarcomponent/materialclasificarcomponent';
import { Materialrankingcomponent } from './components/materialcomponent/materialrankingcomponent/materialrankingcomponent';
import { Tiporecompensacomponent } from './components/tiporecompensacomponent/tiporecompensacomponent';
import { Tiporecompensalistcomponent } from './components/tiporecompensacomponent/tiporecompensalistcomponent/tiporecompensalistcomponent';
import { Tiporecompensainsertcomponent } from './components/tiporecompensacomponent/tiporecompensainsertcomponent/tiporecompensainsertcomponent';
import { Tiporecompensaupdatecomponent } from './components/tiporecompensacomponent/tiporecompensaupdatecomponent/tiporecompensaupdatecomponent';
import { Tiporecompensabuscarcomponent } from './components/tiporecompensacomponent/tiporecompensabuscarcomponent/tiporecompensabuscarcomponent';
import { Tiporecompensarankingcomponent } from './components/tiporecompensacomponent/tiporecompensarankingcomponent/tiporecompensarankingcomponent';

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
    {
        path: 'tiporecompensas',
        component: Tiporecompensacomponent,
        children: [
            { path: 'listar', component: Tiporecompensalistcomponent },
            { path: 'insertar', component: Tiporecompensainsertcomponent },
            { path: 'editar/:id', component: Tiporecompensaupdatecomponent },
            { path: 'buscar', component: Tiporecompensabuscarcomponent },
            { path: 'ranking', component: Tiporecompensarankingcomponent },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    },
    {
        path: 'materiales',
        component: Materialcomponent,
        children: [
            { path: 'listar', component: Materiallistcomponent },
            { path: 'insertar', component: Materialinsertcomponent },
            { path: 'editar/:id', component: Materialupdatecomponent },
            { path: 'buscar', component: Materialbuscarcomponent },
            { path: 'clasificar', component: Materialclasificarcomponent },
            { path: 'ranking', component: Materialrankingcomponent },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    },

    // ---------- Jhon: entregas ----------

    // ---------- Franco: canjes ----------
];
