import { Component, computed, effect, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { LogoComponent } from '../../../../../shared/components/logo/logo.component';
import { LoginRequest } from '../../models/login-request';
import { form, required, FormField } from '@angular/forms/signals';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

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
    PasswordModule
],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {
  constructor(private fb: FormBuilder) { }

  isSubmitting: WritableSignal<boolean> = signal<boolean>(false);
  requestData!: LoginRequest;
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      alert('Submitted!');
      this.isSubmitting.set(false);
    }, 2000);
  }
}
