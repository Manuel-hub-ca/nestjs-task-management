import { Controller, Get } from '@nestjs/common';

@Controller()
export class HomeController {
  @Get()
  getHome(): string {
    return 'Welcome to My Nest.js App!'; // Change this message as needed
  }
}
