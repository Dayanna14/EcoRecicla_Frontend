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
import { Tiporecompensacomponent } from './components/tiporecompensacomponent/tiporecompensacomponent';
import { Tiporecompensalistcomponent } from './components/tiporecompensacomponent/tiporecompensalistcomponent/tiporecompensalistcomponent';
import { Tiporecompensainsertcomponent } from './components/tiporecompensacomponent/tiporecompensainsertcomponent/tiporecompensainsertcomponent';
import { Tiporecompensaupdatecomponent } from './components/tiporecompensacomponent/tiporecompensaupdatecomponent/tiporecompensaupdatecomponent';
import { Tiporecompensabuscarcomponent } from './components/tiporecompensacomponent/tiporecompensabuscarcomponent/tiporecompensabuscarcomponent';
import { Entregacomponent } from './components/entregacomponent/entregacomponent';
import { Entregalistcomponent } from './components/entregacomponent/entregalistcomponent/entregalistcomponent';
import { Entregainsertcomponent } from './components/entregacomponent/entregainsertcomponent/entregainsertcomponent';
import { Entregaupdatecomponent } from './components/entregacomponent/entregaupdatecomponent/entregaupdatecomponent';
import { Entregabuscarcomponent } from './components/entregacomponent/entregabuscarcomponent/entregabuscarcomponent';
import { Usuarioscomponent } from './components/usuarioscomponent/usuarioscomponent';
import { Usuarioslistcomponent } from './components/usuarioscomponent/usuarioslistcomponent/usuarioslistcomponent';
import { Usuariosinsertcomponent } from './components/usuarioscomponent/usuariosinsertcomponent/usuariosinsertcomponent';
import { Usuariosupdatecomponent } from './components/usuarioscomponent/usuariosupdatecomponent/usuariosupdatecomponent';
import { Usuariosbuscarcomponent } from './components/usuarioscomponent/usuariosbuscarcomponent/usuariosbuscarcomponent';
import { Recompensacomponent } from './components/recompensacomponent/recompensacomponent';
import { Recompensalistcomponent } from './components/recompensacomponent/recompensalistcomponent/recompensalistcomponent';
import { Recompensainsertcomponent } from './components/recompensacomponent/recompensainsertcomponent/recompensainsertcomponent';
import { Recompensaupdatecomponent } from './components/recompensacomponent/recompensaupdatecomponent/recompensaupdatecomponent';
import { Recompensabuscarcomponent } from './components/recompensacomponent/recompensabuscarcomponent/recompensabuscarcomponent';
import { Reportscomponents } from './components/reportscomponents/reportscomponents';
import { Dashboardcomponent } from './components/reportscomponents/dashboardcomponent/dashboardcomponent';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Menucomponent } from './components/menucomponent/menucomponent';
import { Reportentrega01 } from './components/reportscomponents/reportsentrega/reportentrega01/reportentrega01';
import { Reportentrega02 } from './components/reportscomponents/reportsentrega/reportentrega02/reportentrega02';

import { Canjelistcomponent } from './components/canjecomponent/canjelistcomponent/canjelistcomponent';
import { Canjeupdatecomponent } from './components/canjecomponent/canjeupdatecomponent/canjeupdatecomponent';
import { Canjeinsertcomponent } from './components/canjecomponent/canjeinsertcomponent/canjeinsertcomponent';
import { Canjecomponent } from './components/canjecomponent/canjecomponent';

import { Registrocomponent } from './components/registrocomponent/registrocomponent';
import { Cambiarcontraseniacomponent } from './components/cambiarcontraseniacomponent/cambiarcontraseniacomponent';
import { Perfilcomponent } from './components/perfilcomponent/perfilcomponent';

export const routes: Routes = [
    // ---------- General ----------
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Homecomponent, title: 'EcoRecicla | Inicio' },
  { path: 'login', component: Logincomponent, title: 'EcoRecicla | Iniciar sesión' },
  // Registro público: cualquier persona crea su cuenta de reciclador
  { path: 'registro', component: Registrocomponent, title: 'EcoRecicla | Crear cuenta' },
  // Cambio de contraseña (obligatorio si entró con una temporal) y "Mi perfil"
  { path: 'cambiar-contrasenia', component: Cambiarcontraseniacomponent, canActivate: [authGuard], title: 'EcoRecicla | Cambiar contraseña' },
  { path: 'perfil', component: Perfilcomponent, canActivate: [authGuard], title: 'EcoRecicla | Mi perfil' },

  {
  path: 'menu',
  component: Menucomponent,
  canActivate: [authGuard],
  title: 'EcoRecicla | Menú',
  },
  // ---------- Reportes (dashboard): cada uno agrega aquí su reporte ----------
  {
    path: 'reportes',
    component: Reportscomponents,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO', 'RECICLADOR'] }, // el reciclador ve "Mi impacto"
    children: [
      { path: 'dashboard', component: Dashboardcomponent, title: 'EcoRecicla | Reportes' },
      { path: 'entregas/detalle', component: Reportentrega01, title: 'EcoRecicla | Entregas por usuario y material',
        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO'] } },
      { path: 'entregas/puntos', component: Reportentrega02, title: 'EcoRecicla | Entregas con más de 100 puntos',
        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO'] } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ---------- Dayana: Roles ----------
  {
    path: 'roles',
    title: 'EcoRecicla | Roles',
    component: Rolcomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    children: [
      { path: 'listar', component: Rollistcomponent },
      { path: 'insertar', component: Rolinsertcomponent },
      { path: 'editar/:id', component: Rolupdatecomponent },
      { path: 'buscar', component: Rolbuscarcomponent },
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
    ],
  },

  // ---------- Dayana: Centros de acopio ----------
  {
    path: 'centrosacopio',
    title: 'EcoRecicla | Centros de acopio',
    component: Centroacopiocomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO', 'RECICLADOR'] },
    children: [
      { path: 'listar', component: Centroacopiolistcomponent },
      { path: 'insertar', component: Centroacopioinsertcomponent,
        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'buscar', component: Centroacopiobuscarcomponent },
      { path: 'editar/:id', component: Centroacopioupdatecomponent,
        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'mapa', component: Mapacentroscomponent },
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
    ],
  },

  // ---------- Nayara: usuarios, recompensas ----------
  {
        path: 'usuarios',
        title: 'EcoRecicla | Usuarios',
        component: Usuarioscomponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMINISTRADOR'] },
        children: [
            { path: 'listar', component: Usuarioslistcomponent },
            { path: 'insertar', component: Usuariosinsertcomponent },
            { path: 'editar/:id', component: Usuariosupdatecomponent },
            { path: 'buscar', component: Usuariosbuscarcomponent },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    },
    {
        path: 'recompensas',
        title: 'EcoRecicla | Recompensas',
        component: Recompensacomponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO', 'RECICLADOR'] }, // el operador consulta el catálogo
        children: [
            { path: 'listar', component: Recompensalistcomponent },
            { path: 'insertar', component: Recompensainsertcomponent,
                    canActivate: [roleGuard],
                    data: { roles: ['ADMINISTRADOR'] },
             },
            { path: 'editar/:id', component: Recompensaupdatecomponent,
                    canActivate: [roleGuard],
                    data: { roles: ['ADMINISTRADOR'] },
             },
            { path: 'buscar', component: Recompensabuscarcomponent },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    },

  // ---------- Axel: tiporecompensas, materiales ----------
  {
    path: 'tiporecompensas',
    title: 'EcoRecicla | Tipos de recompensa',
    component: Tiporecompensacomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    children: [
      { path: 'listar', component: Tiporecompensalistcomponent },
      { path: 'insertar', component: Tiporecompensainsertcomponent },
      { path: 'editar/:id', component: Tiporecompensaupdatecomponent },
      { path: 'buscar', component: Tiporecompensabuscarcomponent },
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
    ],
  },
  {
    path: 'materiales',
    title: 'EcoRecicla | Materiales',
    component: Materialcomponent,
    canActivate: [authGuard, roleGuard],
    // El reciclador consulta los materiales y usa el clasificador IA (no edita)
    data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO', 'RECICLADOR'] },
    children: [
      { path: 'listar', component: Materiallistcomponent },
      { path: 'insertar', component: Materialinsertcomponent,
        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'editar/:id', component: Materialupdatecomponent,
        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'buscar', component: Materialbuscarcomponent },
      { path: 'clasificar', component: Materialclasificarcomponent },
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
    ],
  },

  // ---------- Jhon: entregas ----------
  {
    path: 'entregas',
    title: 'EcoRecicla | Entregas',
    component: Entregacomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO', 'RECICLADOR'] },
    children: [
      { path: 'listar', component: Entregalistcomponent },
      { path: 'insertar', component: Entregainsertcomponent,
        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO'] } },
      { path: 'editar/:id', component: Entregaupdatecomponent,
        canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO'] } },
      { path: 'buscar', component: Entregabuscarcomponent },
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
    ],
  },
    // ---------- Nayara: usuarios, recompensas ----------

    // ---------- Axel: tiporecompensas, materiales ----------

    // ---------- Jhon: entregas ----------

    // ---------- Franco: canjes ----------
    {
        path: 'canjes',
        title: 'EcoRecicla | Canjes',
        component: Canjecomponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMINISTRADOR', 'OPERADOR_CENTRO', 'RECICLADOR'] },
        children: [
            { path: 'listar', component: Canjelistcomponent},
            { path: 'insertar', component: Canjeinsertcomponent,
              canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR', 'RECICLADOR'] } },
            { path: 'editar/:id', component: Canjeupdatecomponent,
              canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
            { path: '', redirectTo: 'listar', pathMatch: 'full' }
        ]
    },


  // ---------- Franco: canjes ----------

  // ---------- Fallback ----------
  { path: '**', redirectTo: 'home' }, // ruta inexistente: al inicio, no al login

];
