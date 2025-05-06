import * as protobuf from 'protobufjs';
import * as path from 'path';
import * as fs from 'fs';

export class RithmicProtoLoader {
  private static instance: RithmicProtoLoader;
  private root: protobuf.Root;

  private constructor() {
    this.root = new protobuf.Root();
    this.loadProtoFiles();
  }

  public static getInstance(): RithmicProtoLoader {
    if (!RithmicProtoLoader.instance) {
      RithmicProtoLoader.instance = new RithmicProtoLoader();
    }
    return RithmicProtoLoader.instance;
  }

  private loadProtoFiles(): void {
    const protoFiles = [
      'base.proto',
      'request_account_list.proto',
      'response_account_list.proto',
      'request_heartbeat.proto',
      'response_heartbeat.proto',
      'request_rithmic_system_info.proto',
      'response_rithmic_system_info.proto',
      'request_login.proto',
      'response_login.proto',
      'request_login_info.proto',
      'response_login_info.proto',
      'request_logout.proto',
      'response_logout.proto',
      'request_trade_routes.proto',
      'response_trade_routes.proto',
      'request_subscribe_for_order_updates.proto',
      'response_subscribe_for_order_updates.proto',
      'request_new_order.proto',
      'response_new_order.proto',
      'exchange_order_notification.proto',
      'rithmic_order_notification.proto'
    ];

    protoFiles.forEach(file => {
      try {
        let protoPath = path.join(process.cwd(), 'out/main/services/masterAccounts/rithmic/proto', file);
        if (!fs.existsSync(protoPath)) {
          // Fallback when file doesn't exist
          protoPath = path.join(__dirname, file);
        }

        this.root.loadSync(protoPath);
      } catch (error) {
        console.error(`Error loading proto file ${file}:`, error);
      }
    });
  }

  public getMessageType(messageName: string): protobuf.Type {
    return this.root.lookupType(messageName);
  }

  public createMessage(messageName: string, data: any): Buffer {
    const MessageType = this.getMessageType(messageName);
    const message = MessageType.create(data);
    return Buffer.from(MessageType.encode(message).finish());
  }

  public decodeMessage(messageName: string, buffer: Buffer): any {
    const MessageType = this.getMessageType(messageName);
    return MessageType.decode(buffer);
  }
}
