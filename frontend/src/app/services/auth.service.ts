import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginUserDTO, RegisterUserDTO } from '../models/auth.model';


@Injectable({
  providedIn: 'root',
})

/**
 * Serviço responsável por autenticação de usuários.
 * Faz chamadas HTTP para a API de /auth e gerencia o token JWT no localStorage.
 */
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Registra um novo usuário enviando os dados de cadastro para a API.
   * @param dto Dados do usuário a ser registrado.
   * @returns Observable com a resposta da API.
   */
  register(dto: RegisterUserDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dto);
  }

  /**
   * Realiza login do usuário enviando as credenciais para a API.
   * Ao receber o accessToken na resposta, armazena-o no localStorage.
   * @param dto Dados de login (usuário/senha).
   * @returns Observable com a resposta da API.
   */
  login(dto: LoginUserDTO): Observable<any> {
    return this.http
      .post<{ accessToken: string }>(`${this.apiUrl}/login`, dto)
      .pipe(tap((res) => this.setToken(res.accessToken)));
  }

  /**
   * Efetua logout removendo o token do localStorage.
   */
  logout(): void {
    localStorage.removeItem('accessToken');
  }

  /**
   * Recupera o token JWT armazenado no localStorage.
   * @returns Token ou null, caso não exista.
   */

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Verifica se existe um token armazenado,
   * indicando se o usuário está logado.
   * @returns true se há token, false caso contrário.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Armazena o token JWT no localStorage.
   * @param token Token retornado pela API após o login.
   */
  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }
}
