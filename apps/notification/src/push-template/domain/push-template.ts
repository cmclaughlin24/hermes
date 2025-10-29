import { AutoMap } from '@automapper/classes';
import { TextDirection } from '@hermes/common';
import { PushAction } from './push-action';

export class PushTemplate {
  @AutoMap()
  name: string;

  @AutoMap()
  badge: string;

  @AutoMap()
  body: string;

  @AutoMap()
  data: string;

  @AutoMap()
  dir: TextDirection;

  @AutoMap()
  icon: string;

  @AutoMap()
  image: string;

  @AutoMap()
  lang: string;

  @AutoMap()
  renotify: boolean;

  @AutoMap()
  requireInteraction: boolean;

  @AutoMap()
  silent: boolean;

  @AutoMap()
  tag: string;

  @AutoMap()
  timestamp: string;

  @AutoMap()
  title: string;

  @AutoMap()
  vibrate: number[];

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;

  @AutoMap(() => [PushAction])
  actions: PushAction[];
}
