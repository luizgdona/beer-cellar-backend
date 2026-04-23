import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User';

@Entity('beers')
@Index(['userId', 'createdAt'])
@Index(['userId', 'consumed'])
export class Beer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string; // Mandatory

  @Column({ type: 'varchar', length: 255 })
  brewery!: string; // Mandatory

  @Column({ type: 'varchar', length: 100, nullable: true })
  style?: string; // e.g., IPA, Stout, Lager

  @Column({ type: 'float', nullable: true })
  abv?: number; // Alcohol by Volume

  @Column({ type: 'int', nullable: true })
  ibu?: number; // International Bitterness Units

  @Column({ type: 'text', nullable: true })
  additives?: string; // Ingredients, preservatives, etc.

  @Column({ type: 'timestamp', nullable: true })
  purchaseDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchaseValue?: number; // Price paid

  @Column({ type: 'varchar', length: 255, nullable: true })
  purchaseLocation?: string; // Where it was bought

  @Column({ type: 'timestamp', nullable: true })
  expirationDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  consumptionReminderDate?: Date; // Google Calendar integration

  @Column({ type: 'varchar', length: 50, nullable: true })
  volume?: string; // e.g., "500ml", "12 oz"

  @Column({ type: 'text', nullable: true })
  imageUrl?: string; // AWS S3 URL

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'float', nullable: true })
  rating?: number; // 0-5 scale

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: false })
  consumed!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  consumedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.beers, { onDelete: 'CASCADE' })
  user!: User;
}
