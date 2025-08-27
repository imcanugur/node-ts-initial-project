export class Ok {
  public status: boolean;
  public data: any;
  public code: number;
  public message: string;

  constructor(result: any, message: string = "success") {
    this.code = 200;
    this.status = true;
    this.message = message;
    this.data = result;
  }
}

export class Created {
  public status: boolean;
  public data: any;
  public code: number;
  public message: string;

  constructor(result: any, message: string = "success") {
    this.code = 201;
    this.status = true;
    this.message = message;
    this.data = result;
  }
}
