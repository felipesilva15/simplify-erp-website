import { TokenDetails } from './../../../../../core/models/token-details';
import { AfterContentInit, AfterViewInit, Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { LogoComponent } from '../../../../../shared/components/logo/logo.component';
import { LoginRequest } from '../../models/login-request';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../../../core/auth/services/auth-service';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    LogoComponent,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    NgClass
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute) { }

  isSubmitting: WritableSignal<boolean> = signal<boolean>(false);
  requestData!: LoginRequest;
  form!: FormGroup;
  redirectLink: WritableSignal<string> = signal<string>('');
  errorMessage: WritableSignal<string> = signal('');
  hasError: Signal<boolean> = computed(() => {
    return this.errorMessage() ? true : false;
  })

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  wrapForm(): void {
    this.requestData = {
      username: this.form.get('username')?.value,
      password: this.form.get('password')?.value
    };
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.wrapForm();

    this.authService.login(this.requestData).subscribe({
      next: (res: TokenDetails) => {
        if (this.redirectLink()) {
          this.router.navigate([this.redirectLink()]);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        if (err.error?.message)
          this.errorMessage.set(err.error.message);
        else
          this.errorMessage.set('Ocorreu um erro desconhecido. Entre em contato com o suporte do sistema.');

        this.isSubmitting.set(false);
      }
    })
  }
}
