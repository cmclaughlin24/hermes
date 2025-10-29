import { RemoveCache, UseCache, defaultHashFn } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushTemplateRepository } from './repository/push-template.repository';

@Injectable()
export class PushTemplateService {
  private static readonly CACHE_KEY = 'push-notification';

  constructor(private readonly repository: PushTemplateRepository) {}

  /**
   * Yields a list of PushTemplates.
   */
  async findAll() {
    return this.repository.findAll();
  }

  /**
   * Yields an PushTemplate or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} name Template's name
   */
  @UseCache({ key: PushTemplateService.CACHE_KEY })
  async findOne(name: string) {
    return this.repository.findOne(name);
  }

  /**
   * Creates a new PushTemplate or throws an ExistsException if an
   * push notification template name exists in the repository.
   * @param {CreatePushTemplateDto} createPushTemplateDto
   */
  async create(createPushTemplateDto: CreatePushTemplateDto) {
    return this.repository.create(createPushTemplateDto);
  }

  /**
   * Updates a PushTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @param {UpdatePushTemplateDto} updatePushTemplateDto
   */
  @RemoveCache({
    key: PushTemplateService.CACHE_KEY,
    hashFn: (key, args) => defaultHashFn(key, [args[0]]),
  })
  async update(name: string, updatePushTemplateDto: UpdatePushTemplateDto) {
    return this.repository.update(name, updatePushTemplateDto);
  }

  /**
   * Removes an PushTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   */
  @RemoveCache({ key: PushTemplateService.CACHE_KEY })
  async remove(name: string) {
    await this.repository.remove(name);
  }
}
