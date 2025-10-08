import { Property, Required, MinLength, MaxLength, Pattern, Example } from "@tsed/schema";

export class CreateMilestoneCategoryDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(100)
  @Example("Wedding Day")
  name!: string;

  @Property()
  @MaxLength(255)
  @Example("Celebrate your wedding day")
  description?: string;

  @Property()
  @MaxLength(50)
  @Example("heart")
  icon?: string;

  @Property()
  @Pattern(/^#[0-9A-Fa-f]{6}$/)
  @Example("#FF6B6B")
  color?: string;

  @Property()
  @Example(true)
  isPublic?: boolean;

  @Property()
  @Example(0)
  sortOrder?: number;


  @Property()
  @Example({ customField: "value" })
  metadata?: any;
}

export class UpdateMilestoneCategoryDto {
  @Property()
  @MinLength(1)
  @MaxLength(100)
  @Example("Wedding Day")
  name?: string;

  @Property()
  @MaxLength(255)
  @Example("Celebrate your wedding day")
  description?: string;

  @Property()
  @MaxLength(50)
  @Example("heart")
  icon?: string;

  @Property()
  @Pattern(/^#[0-9A-Fa-f]{6}$/)
  @Example("#FF6B6B")
  color?: string;

  @Property()
  @Example(true)
  isPublic?: boolean;

  @Property()
  @Example(true)
  isActive?: boolean;

  @Property()
  @Example(0)
  sortOrder?: number;


  @Property()
  @Example({ customField: "value" })
  metadata?: any;
}

export class MilestoneCategorySearchDto {
  @Property()
  @Example("true")
  isPublic?: string;

  @Property()
  @Example("true")
  isActive?: string;


  @Property()
  @Example("Wedding")
  search?: string;

  @Property()
  @Example("name")
  sortBy?: string;

  @Property()
  @Example("ASC")
  sortOrder?: string;

  @Property()
  @Example("20")
  limit?: string;

  @Property()
  @Example("0")
  offset?: string;
}

export class MilestoneCategoryResponseDto {
  @Property()
  @Example("123e4567-e89b-12d3-a456-426614174000")
  id!: string;

  @Property()
  @Example("Wedding Day")
  name!: string;

  @Property()
  @Example("Celebrate your wedding day")
  description?: string;

  @Property()
  @Example("heart")
  icon?: string;

  @Property()
  @Example("#FF6B6B")
  color?: string;

  @Property()
  @Example(true)
  isPublic!: boolean;

  @Property()
  @Example(true)
  isActive!: boolean;

  @Property()
  @Example(0)
  sortOrder!: number;

  @Property()
  @Example("123e4567-e89b-12d3-a456-426614174000")
  userId?: string;


  @Property()
  @Example({ customField: "value" })
  metadata?: any;

  @Property()
  @Example("2024-01-01T00:00:00.000Z")
  createdAt!: Date;

  @Property()
  @Example("2024-01-01T00:00:00.000Z")
  updatedAt!: Date;

  @Property()
  @Example(5)
  milestoneCount?: number;

}

export class MilestoneCategoryStatsDto {
  @Property()
  @Example(10)
  totalCategories!: number;

  @Property()
  @Example(6)
  publicCategories!: number;

  @Property()
  @Example(4)
  personalCategories!: number;

  @Property()
  @Example(8)
  activeCategories!: number;

  @Property()
  @Example([
    { id: "123e4567-e89b-12d3-a456-426614174000", name: "Wedding Day", count: 15 },
    { id: "123e4567-e89b-12d3-a456-426614174001", name: "Anniversary", count: 12 }
  ])
  mostUsedCategories!: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}
