import { AuthService } from '../../auth/_service/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'fema-cms-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  tokenIsCopied: boolean;
  tokenIsNotCopied: boolean;

  constructor(public authSvc: AuthService) {
    this.tokenIsCopied = true;
    this.tokenIsNotCopied = true;
  }

  doLogout(evt: Event): void {
    evt.preventDefault();
    this.authSvc.doLogout();
  }

  copyXAuthToken(evt: Event): void {
    evt.preventDefault();

    const domToken = document.createElement('textarea');

    domToken.style.position = 'fixed';
    domToken.style.top = '0';
    domToken.style.left = '0';
    domToken.style.opacity = '0';
    domToken.value = this.authSvc.getAuth.token;

    document.body.appendChild(domToken);

    domToken.select();

    try {
      this.tokenIsCopied = document.execCommand('copy');
    } catch (err) {
      this.tokenIsCopied = false;
    }

    this.tokenIsNotCopied = !this.tokenIsCopied;

    document.body.removeChild(domToken);
  }
}
