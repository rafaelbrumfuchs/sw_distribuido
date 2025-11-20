import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { Product, Supplier } from '../models/product-entry.model';
import { ProductEntryListDto } from '../components/product-entry/dto/list-product-entry.dto';

@Injectable({
  providedIn: 'root',
})
/**
 * Serviço responsável pelo gerenciamento de:
 * - Entradas de produtos
 * - Produtos
 * - Fornecedores
 *
 * Centraliza as chamadas HTTP relacionadas a esses recursos.
 */
export class ProductEntryService {
  private entryApiUrl = `${environment.apiUrl}/product-entry`;
  private productApiUrl = `${environment.apiUrl}/products`;
  private supplierApiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  // ================= ENTRADAS =================
  /**
   * Obtém a lista de entradas de produtos cadastradas.
   * @returns Observable com lista de ProductEntryListDto.
   */
  getEntries(): Observable<ProductEntryListDto[]> {
    return this.http.get<ProductEntryListDto[]>(
      `${environment.apiUrl}/product-entry`
    );
  }

  /**
   * Cria uma nova entrada de produto enviando os dados via FormData.
   * Geralmente usado quando há upload de arquivo (ex.: XML, PDF etc.).
   *
   * @param formData Dados da entrada (campos + arquivos).
   * @returns Observable com a entrada criada.
   */
  createEntry(formData: FormData) {
    return this.http.post<ProductEntryListDto>(
      `${environment.apiUrl}/product-entry`,
      formData
    );
  }

  /**
   * Remove uma entrada de produto específica pelo seu ID.
   *
   * @param id Identificador da entrada.
   * @returns Observable<void> indicando conclusão da operação.
   */
  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.entryApiUrl}/${id}`);
  }

  // ================= PRODUTOS =================
  /**
   * Obtém a lista de produtos cadastrados.
   *
   * @returns Observable com array de Product.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productApiUrl);
  }

  /**
   * Busca um produto específico pelo ID.
   * Caso o ID seja inválido ou haja erro na requisição, retorna null.
   *
   * @param id Identificador do produto.
   * @returns Observable com Product ou null em caso de falha.
   */
  getProductById(id: number): Observable<Product | null> {
    if (isNaN(id)) return of(null);

    return this.http
      .get<Product>(`${this.productApiUrl}/${id}`)
      .pipe(catchError(() => of(null)));
  }

  // ================= FORNECEDORES =================
  /**
   * Obtém a lista de fornecedores cadastrados.
   *
   * @returns Observable com array de Supplier.
   */
  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.supplierApiUrl);
  }

  /**
   * Busca um fornecedor específico pelo ID.
   * Caso o ID seja inválido ou haja erro na requisição, retorna null.
   *
   * @param id Identificador do fornecedor.
   * @returns Observable com Supplier ou null em caso de falha.
   */
  getSupplierById(id: number): Observable<Supplier | null> {
    if (isNaN(id)) return of(null);

    return this.http
      .get<Supplier>(`${this.supplierApiUrl}/${id}`)
      .pipe(catchError(() => of(null)));
  }

  // ================= UTILITÁRIOS =================
  /**
   * Gera um identificador de entrada de produto a partir:
   * - Das iniciais do nome do produto
   * - De um número aleatório de 4 dígitos
   *
   * Em seguida embaralha os caracteres e retorna apenas 6 deles.
   *
   * @param productName Nome do produto usado como base.
   * @returns String com ID de 6 caracteres.
   */
  generateEntryId(productName: string): string {
    const initials = productName
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();

    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');

    const combined = (initials + randomNum)
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    return combined.substring(0, 6);
  }
}
