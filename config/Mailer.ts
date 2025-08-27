import { Service } from "typedi";
import nodemailer, { Transporter } from "nodemailer";
import config from "config";
import fs from "fs";
import path from "path";

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  log?: boolean;
}

@Service()
export default class Mailer {
  private readonly transporter: Transporter;
  private readonly config: MailConfig;

  constructor() {
    this.config = config.get<MailConfig>("mail");

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.user,
        pass: this.config.pass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject,
        html,
      });

      if (this.config.log) this.log(to, subject);
    } catch (err) {
      throw new Error(`Failed to send mail to ${to}: ${err}`);
    }
  }

  async sendMailWithRetry(
    to: string,
    subject: string,
    html: string,
    retries = 3,
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.sendMail(to, subject, html);
        return;
      } catch (err) {
        if (attempt === retries) throw err;
        await this.wait(1000 * attempt);
      }
    }
  }

  async sendOTP(to: string, otpCode: string): Promise<void> {
    const subject = "OTP Kodunuz";
    const html = `
      <div style="font-family: sans-serif;">
        <h2>OTP Kodunuz:</h2>
        <p style="font-size: 24px; font-weight: bold;">${otpCode}</p>
        <p>Kod 5 dakika geçerlidir.</p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }

  async sendTemplate(
    to: string,
    subject: string,
    templateName: string,
    variables: Record<string, string>,
  ): Promise<void> {
    const html = this.renderTemplate(templateName, variables);
    await this.sendMail(to, subject, html);
  }

  private renderTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    const templatePath = path.resolve(
      __dirname,
      "../templates",
      `${templateName}.html`,
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Mail template not found: ${templateName}`);
    }

    let template = fs.readFileSync(templatePath, "utf8");

    for (const key in variables) {
      template = template.replace(
        new RegExp(`{{${key}}}`, "g"),
        variables[key],
      );
    }

    return template;
  }

  private wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(to: string, subject: string) {
    const line = `${new Date().toISOString()} | To: ${to} | Subject: ${subject}\n`;
    const logPath = path.resolve(__dirname, "../logs/mails.log");
    fs.appendFileSync(logPath, line);
  }
}
