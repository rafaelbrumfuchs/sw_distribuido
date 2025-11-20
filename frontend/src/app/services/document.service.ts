import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
/**
 * Serviço responsável por operações relacionadas a documentos.
 * Faz busca, filtro e download de documentos na API.
 */
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;
  constructor(private http: HttpClient) {}

  /**
   * Busca lista de documentos na API, aplicando filtros opcionais via query string.
   * Filtros suportados: filename, id, upload_date.
   *
   * @param filters Objeto com propriedades opcionais para filtrar os documentos.
   * @returns Observable com array de documentos filtrados.
   */
  getDocuments(filters: any = {}): Observable<any[]> {
    let params = new HttpParams();

    if (filters.filename) {
      params = params.set('filename', filters.filename);
    }

    if (filters.id) {
      params = params.set('id', filters.id);
    }

    if (filters.upload_date) {
      params = params.set('upload_date', filters.upload_date);
    }

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  /**
   * Realiza o download de um documento específico, retornando um Blob.
   * Ideal para ser utilizado na geração de um link de download ou criação de URL de arquivo.
   *
   * @param id Identificador do documento a ser baixado.
   * @returns Observable com o conteúdo do arquivo em formato Blob.
   */
  downloadDocument(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob',
    });
  }
}
