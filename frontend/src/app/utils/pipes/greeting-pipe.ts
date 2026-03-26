import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'greeting',
  standalone: true
})
export class GreetingPipe implements PipeTransform {
  transform(userName: string): string {
    // Determina a hora atual
    const hour = new Date().getHours();

    // Returna saudação apropriada com o nome do utilizador
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${userName}`;
    } else if (hour >= 12 && hour < 18) {
      return `Good afternoon, ${userName}`;
    }

    return `Good evening, ${userName}`;
  }
}
