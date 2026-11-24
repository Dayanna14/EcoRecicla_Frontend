export class LoginResponseDTO {
    token: string = ''
    username: string = ''
    roles: string[] = []
    // Agregados al backend: quién es el usuario y si debe cambiar su contraseña temporal
    idUsuario: number | null = null
    nombre: string = ''
    debeCambiarContrasenia: boolean = false
}
