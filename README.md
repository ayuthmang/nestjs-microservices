## Diving in 🔎

### Creating our first Microservice

```
// ⚙️ Terminal - generate wokflows service Application (microservice)
nest g app workflows-service

// ⚙️ Terminal - Generate workflows "Resource" - and place inside ⚠️ Wworkflow-Service Application
nest g resource workflows
/**
 * ⚠️ The CLI will prompt us to select the application where we want to generate the resource.
 * We'll select the "workflows-service" application. The CLI will then generate the resource for us
 * and update the "workflows-service" application module.
**/

// ⚙️ Terminal - Generate workflows "Resource" - and place inside ⚠️ Virtual-Facility Application
nest g resource buildings

// ----------------------------
/**
 *   🗂 /apps/
 *    ┄ 🗂 /virtual-facility/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /buildings/
            ┄ 📝  buildings.service.ts - [ UPDATE FILE - add method ]
**/
import { Injectable } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  async create(createBuildingDto: CreateBuildingDto) { // 👈
    // TODO: Insert a new building into the database
    await this.createWorkflow(1);
    return 'This action adds a new building';
  }

  findAll() {
    return `This action returns all buildings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} building`;
  }

  update(id: number, updateBuildingDto: UpdateBuildingDto) {
    return `This action updates a #${id} building`;
  }

  remove(id: number) {
    return `This action removes a #${id} building`;
  }

  async createWorkflow(buildingId: number) { // 👈
    return fetch('http://localhost:3001/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Workflow', buildingId }),
    }).then((res) => res.text());
  }
}
/**
 * > NOTE: For those using older versions of Node.js (<= v17), you may need to install the
 * "node-fetch" package to use the "fetch" function, or, alternatively, use `@nestjs/axios`
 * for the same functionality.
**/

// ⚙️ Terminal - Run both applications (microservices)
npm run start:dev -- virtual-facility
// and in a separate terminal window:
npm run start:dev -- workflows-service

// ----------------------------
// 🌍🌍🌍 Testing everything - CURL requests
curl -X POST http://localhost:3000/buildings -H "Content-Type: application/json" -d '{"name": "Building 1"}'
```

### Configuring Docker Compose

```
// ----------------------------
// 📝 docker-compose.yml
version: "3.8"

services:
  workflows-service:
    build:
      context: .
      dockerfile: ./Dockerfile
      args:
        - APP_NAME=workflows-service
    command: npm run start:dev -- workflows-service # This instructs Docker Compose to run the "start:dev" script when starting the container
    environment: # Here we specify the environment variables that will be passed to the container
      - POSTGRES_HOST=workflows-db
      - POSTGRES_PORT=5432
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=workflows
    volumes:
      - ./libs:/usr/src/app/libs
      - ./package.json:/usr/src/app/package.json
      - ./tsconfig.json:/usr/src/app/tsconfig.json
      # Note: This is usually not a good practice to mount the "node_modules" directory on the host to the container       # We are doing this for the sake of simplicity in this example       - ./node_modules:/usr/src/app/node_modules
      # This instructs Docker Compose to mount the "workflows-service" directory on the host to the "/usr/src/app" directory on the container
      # This allows us to make changes to the code on the host and have them reflected in the container without having to rebuild the image
      - ./apps/workflows-service:/usr/src/app/apps/workflows-service
    depends_on: # This instructs Docker Compose to start the "workflows-db" container before starting the "workflows-service" container
      - workflows-db
  workflows-db:
    image: postgres:13.2-alpine
    environment: # We need to make sure these environment variables match the ones we specified in the "workflows-service" service
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=workflows
  virtual-facility:
    build:
      context: .
      dockerfile: ./Dockerfile
      args:
        - APP_NAME=virtual-facility
    command: npm run start:dev -- virtual-facility
    ports:
      - 3000:3000 # This instructs Docker Compose to map port 3000 on the host to port 3000 on the container
    environment:
      - POSTGRES_HOST=virtual-facility-db
      - POSTGRES_PORT=5432
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=virtual-facility
    volumes:
      - ./libs:/usr/src/app/libs
      - ./package.json:/usr/src/app/package.json
      - ./tsconfig.json:/usr/src/app/tsconfig.json
      # Note: This is usually not a good practice to mount the "node_modules" directory on the host to the container       # We are doing this for the sake of simplicity in this example       - ./node_modules:/usr/src/app/node_modules
      - ./apps/virtual-facility:/usr/src/app/apps/virtual-facility
    depends_on:
      - virtual-facility-db
      - workflows-service
  virtual-facility-db:
    image: postgres:13.2-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=virtual-facility

// ----------------------------
// ----------------------------
// ----------------------------
// ----------------------------
// 📝 Dockerfile
# Base image
FROM node:18-alpine

# Define variables
ARG APP_NAME

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build -- ${APP_NAME}

# Start the server using the production build
CMD [ "node", "dist/apps/${APP_NAME}/main.js" ]


// ----------------------------
// ----------------------------
// ⚙️ Terminal
docker compose up
```

- 🗂️ / apps
  - 🗂️ / virtual-facility /

```
// ----------------------------
/**
 *   🗂 /apps/
 *    ┄ 🗂 /virtual-facility/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /buildings/
 *          ┄ 🗂 /entities/
              ┄ 📝  building.entity.ts - [ NEW FILE ]
**/
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

// ----------------------------
/**
 *   🗂 /apps/
 *    ┄ 🗂 /virtual-facility/
 *      ┄ 🗂 /src/
          ┄ 📝  app.module.ts - [ UPDATE FILE ]
**/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuildingsModule } from './buildings/buildings.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    BuildingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// ----------------------------
/**
 *   🗂 /apps/
 *    ┄ 🗂 /virtual-facility/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /buildings/
            ┄ 📝  buildings.service.ts - [ UPDATE FILE - NOTE* FINAL RESULT OF LESSON - Replace methods, etc ]
**/
import { CreateWorkflowDto } from '@app/workflows';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingsRepository: Repository<Building>,
  ) {}

  async findAll(): Promise<Building[]> {
    return this.buildingsRepository.find();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingsRepository.findOne({ where: { id } });
    if (!building) {
      throw new NotFoundException(`Building #${id} does not exist`);
    }
    return building;
  }

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const building = this.buildingsRepository.create({
      ...createBuildingDto,
    });
    const newBuildingEntity = await this.buildingsRepository.save(building);

    // Create a workflow for the new building
    await this.createWorkflow(newBuildingEntity.id);
    return newBuildingEntity;
  }

  async update(
    id: number,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingsRepository.preload({
      id: +id,
      ...updateBuildingDto,
    });

    if (!building) {
      throw new NotFoundException(`Building #${id} does not exist`);
    }
    return this.buildingsRepository.save(building);
  }

  async remove(id: number): Promise<Building> {
    const building = await this.findOne(id);
    return this.buildingsRepository.remove(building);
  }

  async createWorkflow(buildingId: number) {
    console.log(
      JSON.stringify({ name: 'My Workflow', buildingId } as CreateWorkflowDto),
    );
    const response = await fetch('http://workflows-service:3001/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Workflow', buildingId }),
    });
    const newWorkflow = await response.json();
    console.log({ newWorkflow });
    return newWorkflow;
  }
}

/**
 *   🗂 /apps/
 *    ┄ 🗂 /virtual-facility/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /buildings/
            ┄ 📝  buildings.module.ts - [ UPDATE FILE ]
**/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { Building } from './entities/building.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Building])], // 👈
  controllers: [BuildingsController],
  providers: [BuildingsService],
})
export class BuildingsModule {}
```

```
// ⚙️ Terminal - Install TypeORM and Postgres
npm install --save @nestjs/typeorm typeorm pg

// ----------------------------
// ----------------------------
// 🌍🌍🌍 For TESTING - CURL requests
curl -X POST http://localhost:3000/buildings -H "Content-Type: application/json" -d '{"name": "Building 1"}'


// ----------------------------
// ⚙️ Terminal - create workflows Library (/libs)
nest g lib workflows

// ⚙️ Terminal - Install dependencies
npm i class-transformer class-validator
```

- 🗂️ / apps
  - 🗂️ / workflows-service /

```
// ----------------------------
/**   🗂 /apps/
 *    ┄ 🗂 /workflows-service/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /workflows/
 *          ┄ 🗂 /entities/
              ┄ 📝  workflow.entity.ts - [ NEW FILE ]
**/
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  buildingId: number;
}

// ----------------------------
/**
 *   🗂 /apps/
 *    ┄ 🗂 /workflows-service/
 *      ┄ 🗂 /src/
          ┄ 📝  workflows-service.module.ts - [ UPDATE FILE ]
**/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsServiceController } from './workflows-service.controller';
import { WorkflowsServiceService } from './workflows-service.service';
import { WorkflowsModule } from './workflows/workflows.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    WorkflowsModule,
  ],
  controllers: [WorkflowsServiceController],
  providers: [WorkflowsServiceService],
})
export class WorkflowsServiceModule {}

// ----------------------------
/**
 *   🗂 /apps/
 *    ┄ 🗂 /workflows-service/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /workflows/
            ┄ 📝  workflows.service.ts - [ UPDATE FILE - NOTE* FINAL RESULT OF LESSON]
**/
import { CreateWorkflowDto, UpdateWorkflowDto } from '@app/workflows';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowsRepository: Repository<Workflow>,
  ) {}

  async findAll(): Promise<Workflow[]> {
    return this.workflowsRepository.find();
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.workflowsRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow #${id} does not exist`);
    }
    return workflow;
  }

  async create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowsRepository.create({
      ...createWorkflowDto,
    });
    const newWorkflowEntity = await this.workflowsRepository.save(workflow);
    return newWorkflowEntity;
  }

  async update(
    id: number,
    updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const workflow = await this.workflowsRepository.preload({
      id: +id,
      ...updateWorkflowDto,
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow #${id} does not exist`);
    }
    return this.workflowsRepository.save(workflow);
  }

  async remove(id: number): Promise<Workflow> {
    const workflow = await this.findOne(id);
    return this.workflowsRepository.remove(workflow);
  }
}

// ----------------------------
/**
 *   🗂 /apps/
 *    ┄ 🗂 /workflows-service/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /workflows/
            ┄ 📝  workflows.module.ts - [ UPDATE FILE ]
**/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from './entities/workflow.entity';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow])], // 👈
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
})
export class WorkflowsModule {}
```

- 🗂️ / libs /
  - 🗂️ / workflows /

```
// ----------------------------
/**
 *   🗂 /libs/
 *    ┄ 🗂 /workflows/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /dto/
            ┄ 📝  create-workflow.dto.ts - [ NEW FILE ]
**/
import { IsNumber, IsString } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsNumber()
  buildingId: number;
}

// ----------------------------
/**
 *   🗂 /libs/
 *    ┄ 🗂 /workflows/
 *      ┄ 🗂 /src/
 *        ┄ 🗂 /dto/
            ┄ 📝  update-workflow.dto.ts - [ NEW FILE ]
**/
import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkflowDto } from './create-workflow.dto';

export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {}

// ----------------------------
/**
 *   🗂 /libs/
 *    ┄ 🗂 /workflows/
 *      ┄ 🗂 /src/
          ┄ 📝  index.ts - [ NEW FILE ]
**/
export * from './dto/create-workflow.dto';
export * from './dto/update-workflow.dto';
```
