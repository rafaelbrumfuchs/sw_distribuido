import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
/**
 * Serviço responsável por operações de CRUD de fornecedores.
 * Usa o repositório TypeORM de `Supplier` para acessar o banco de dados.
 */
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  /**
   * Retorna todos os fornecedores cadastrados.
   */
  findAll(): Promise<Supplier[]> {
    return this.repo.find();
  }

  /**
   * Busca um fornecedor pelo ID.
   * Retorna `null` se não encontrar.
   */
  findOne(id: number): Promise<Supplier | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Cria um novo fornecedor a partir do DTO recebido
   * e persiste no banco de dados.
   */
  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.repo.create(dto);
    return this.repo.save(supplier);
  }

  /**
   * Atualiza os dados de um fornecedor existente.
   * Lança `NotFoundException` se o fornecedor não for encontrado.
   */
  async update(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.repo.preload({ id, ...dto });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return this.repo.save(supplier);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
  /**
   * Busca fornecedor pelo código informado.
   * Lança `NotFoundException` se nenhum fornecedor for encontrado com o código.
   */
  async findByCode(code: number): Promise<Supplier> {
    const supplier = await this.repo.findOne({ where: { id: code } });
    if (!supplier) {
      throw new NotFoundException(`Fornecedor com código ${code} não encontrado.`);
    }
    return supplier;
  }
}
