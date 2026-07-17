import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';
import { InteractiveBackdropComponent } from '../../shared/interactive-backdrop/interactive-backdrop.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InteractiveBackdropComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  formSubmitted = false;
  submitMessage = '';
  submitError = false;
  isSubmitting = false;

  private readonly isBrowser: boolean;

  private readonly EMAILJS_SERVICE_ID = environment.emailjs.serviceId;
  private readonly EMAILJS_TEMPLATE_ID = environment.emailjs.templateId;
  private readonly EMAILJS_PUBLIC_KEY = environment.emailjs.publicKey;
  private readonly RECIPIENT_EMAIL = environment.emailjs.recipientEmail;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private fb: FormBuilder
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      project: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    if (this.isBrowser && this.isEmailConfigured) {
      emailjs.init(this.EMAILJS_PUBLIC_KEY);
    }
  }

  /** EmailJS only works once real service/template IDs are set in the environment. */
  get isEmailConfigured(): boolean {
    return (
      !!this.EMAILJS_SERVICE_ID &&
      !this.EMAILJS_SERVICE_ID.startsWith('YOUR_') &&
      !!this.EMAILJS_TEMPLATE_ID &&
      !this.EMAILJS_TEMPLATE_ID.startsWith('YOUR_')
    );
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.contactForm.invalid || this.isSubmitting) return;

    // Fall back to a mailto link if EmailJS is not configured yet.
    if (!this.isEmailConfigured) {
      this.submitError = false;
      this.submitMessage =
        'Email service is not configured yet — please reach out at ' + this.RECIPIENT_EMAIL + '.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = false;
    this.submitMessage = 'Sending your message...';

    const formData = this.contactForm.value;
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      project_details: formData.project,
      to_email: this.RECIPIENT_EMAIL,
    };

    emailjs
      .send(this.EMAILJS_SERVICE_ID, this.EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        this.submitError = false;
        this.submitMessage = "Thanks for reaching out! I'll get back to you as soon as possible.";
        this.contactForm.reset();
        this.formSubmitted = false;
        this.isSubmitting = false;
        this.clearMessageLater();
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        this.submitError = true;
        this.submitMessage =
          'There was an error sending your message. Please try again or email me directly.';
        this.isSubmitting = false;
        this.clearMessageLater();
      });
  }

  private clearMessageLater(): void {
    if (!this.isBrowser) return;
    setTimeout(() => (this.submitMessage = ''), 6000);
  }

  get nameControl() {
    return this.contactForm.get('name');
  }
  get emailControl() {
    return this.contactForm.get('email');
  }
  get projectControl() {
    return this.contactForm.get('project');
  }
}
