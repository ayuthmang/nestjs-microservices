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
