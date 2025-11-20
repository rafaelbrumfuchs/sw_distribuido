import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import type { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})

/**
 * Serviço responsável pelo gerenciamento de usuários.
 * Centraliza operações de listagem, criação, atualização e remoção na API.
 */
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Retorna apenas o array de usuários
  /**
   * Obtém a lista de usuários cadastrados.
   * A resposta da API possui um objeto com a propriedade "users",
   * e este método faz o mapeamento para retornar somente o array interno.
   *
   * @returns Observable com array de User.
   */
  getUsers(): Observable<User[]> {
    return this.http
      .get<{ users: User[] }>(this.apiUrl)
      .pipe(map((response) => response.users));
  }

  /**
   * Cria um novo usuário enviando os dados para a API.
   *
   * @param user Objeto User com os dados do novo usuário.
   * @returns Observable com o usuário criado.
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Atualiza parcialmente os dados de um usuário existente.
   *
   * @param id Identificador do usuário.
   * @param user Objeto parcial com campos a serem atualizados.
   * @returns Observable com o usuário atualizado.
   */
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Remove um usuário específico com base no seu ID.
   *
   * @param id Identificador do usuário.
   * @returns Observable<void> indicando a conclusão da remoção.
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
