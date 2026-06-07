import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { MediaQueryDto } from './dto/media-query.dto';
import { MediaService } from './media.service';

const MAX_FILES = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = /^image\/(jpeg|png|webp|gif)$/;

@ApiTags('admin · archivos')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Biblioteca de archivos (paginado, búsqueda y filtro de uso)' })
  findAll(@Query() query: MediaQueryDto) {
    return this.media.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Subir una o varias imágenes a la biblioteca' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.test(file.mimetype)) {
          cb(new BadRequestException('Formato no permitido. Usa JPG, PNG, WEBP o GIF.'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }
    return this.media.upload(files);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle del archivo + dónde se usa' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.media.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar archivo (bloqueado si está en uso)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.media.remove(id);
  }
}
