import axios from "axios";
import { Service } from "typedi";
import config from "config";

interface NetGsmConfig {
  usercode: string;
  password: string;
  msgheader: string;
  domain: string;
  crmdomain: string;
}

@Service()
export default class NetGSM {
  private readonly config: NetGsmConfig;

  constructor() {
    this.config = config.get<NetGsmConfig>("netgsm");
  }

  async sendOTP(phoneNumber: string, code: string): Promise<void> {
    const message = `kod: ${code}. 5 dakika geçerlidir.`;

    const xml = this.buildXml(phoneNumber, message);

    try {
      const response = await axios.post(
        `${this.config.domain}sms/send/otp`,
        xml,
        {
          headers: {
            "Content-Type": "application/xml",
          },
        },
      );

      console.log("NetGSM Response:", response.data);

      if (!response.data.includes("<code>0</code>")) {
        throw new Error(`NetGSM hata: ${response.data}`);
      }
    } catch (error: any) {
      console.error("NetGSM gönderim hatası:", error.message || error);
      throw new Error("SMS gönderilemedi.");
    }
  }

  private buildXml(phone: string, msg: string): string {
    return `<?xml version="1.0"?>
<mainbody>
   <header>
       <usercode>${this.config.usercode}</usercode>
       <password>${this.config.password}</password>
       <msgheader>${this.config.msgheader}</msgheader>
   </header>
   <body>
       <msg><![CDATA[${msg}]]></msg>
       <no>${phone}</no>
   </body>
</mainbody>`;
  }

  async startConference(
    caller: string,
    called: string,
    crm_id: string,
  ): Promise<any> {
    const url = `${this.config.crmdomain}linkup`;

    const params = new URLSearchParams({
      username: this.config.usercode,
      password: this.config.password,
      caller,
      called,
      ring_timeout: "20",
      crm_id,
      wait_response: "1",
      originate_order: "if",
      trunk: this.config.usercode,
    });

    const fullUrl = `${url}?${params.toString()}`;
    try {
      const response = await axios.get(fullUrl);
      return response.data;
    } catch (error: any) {
      throw new Error("Konferans başlatılamadı.");
    }
  }
}
