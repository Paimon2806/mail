import { Property, Required, MinLength, MaxLength, Pattern, Example } from "@tsed/schema";

export class CreateMilestoneDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(255)
  @Example("My Wedding Day")
  title: string;

  @Property()
  @MaxLength(1000)
  @Example("The most beautiful day of my life")
  description?: string;

  @Property()
  @Required()
  @Example("category-uuid-here")
  milestoneCategoryId: string;

  @Property()
  @Required()
  @Example("2024-06-15")
  milestoneDate: string;

  @Property()
  @MaxLength(255)
  @Example("Paris, France")
  location?: string;

  @Property()
  @Example(["Wedding", "Anniversary", "Travel"])
  tags?: string[];

  @Property()
  @Example({ weather: "sunny", guests: 150 })
  metadata?: Record<string, any>;

  @Property()
  @Example(false)
  isPrivate?: boolean;

  @Property()
  @MaxLength(255)
  @Example("Wedding Ceremony")
  occasion?: string;

  @Property()
  @MaxLength(2000)
  @Example("Everything was perfect, from the ceremony to the reception")
  notes?: string;
}

export class UpdateMilestoneDto {
  @Property()
  @MinLength(1)
  @MaxLength(255)
  @Example("My Wedding Day")
  title?: string;

  @Property()
  @MaxLength(1000)
  @Example("The most beautiful day of my life")
  description?: string;

  @Property()
  @Example("category-uuid-here")
  milestoneCategoryId?: string;

  @Property()
  @Example("2024-06-15")
  milestoneDate?: string;

  @Property()
  @MaxLength(255)
  @Example("Paris, France")
  location?: string;

  @Property()
  @Example(["Wedding", "Anniversary", "Travel"])
  tags?: string[];

  @Property()
  @Example({ weather: "sunny", guests: 150 })
  metadata?: Record<string, any>;

  @Property()
  @Example(false)
  isPrivate?: boolean;

  @Property()
  @MaxLength(255)
  @Example("Wedding Ceremony")
  occasion?: string;

  @Property()
  @MaxLength(2000)
  @Example("Everything was perfect, from the ceremony to the reception")
  notes?: string;
}

export class MilestoneSearchDto {
  @Property()
  @Example("category-uuid-here")
  milestoneCategoryId?: string;

  @Property()
  @Example(["Wedding", "Anniversary"])
  tags?: string[];

  @Property()
  @Example("2024-01-01")
  dateFrom?: string;

  @Property()
  @Example("2024-12-31")
  dateTo?: string;

  @Property()
  @MaxLength(255)
  @Example("Paris")
  location?: string;

  @Property()
  @Example(false)
  isPrivate?: boolean;

  @Property()
  @MaxLength(255)
  @Example("wedding")
  search?: string;

  @Property()
  @Pattern(/^(title|milestoneDate|createdAt)$/)
  @Example("milestoneDate")
  sortBy?: string;

  @Property()
  @Pattern(/^(ASC|DESC)$/)
  @Example("DESC")
  sortOrder?: "ASC" | "DESC";

  @Property()
  @Pattern(/^\d+$/)
  @Example("10")
  limit?: string;

  @Property()
  @Pattern(/^\d+$/)
  @Example("0")
  offset?: string;
}

export class MilestoneResponseDto {
  @Property()
  @Example("123e4567-e89b-12d3-a456-426614174000")
  id: string;

  @Property()
  @Example("My Wedding Day")
  title: string;

  @Property()
  @Example("The most beautiful day of my life")
  description?: string;

  @Property()
  @Example("category-uuid-here")
  milestoneCategoryId: string;

  @Property()
  @Example({
    id: "category-uuid-here",
    name: "Relationship Moments",
    icon: "❤️",
    color: "#FF6B6B"
  })
  milestoneCategory: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };

  @Property()
  @Example("2024-06-15")
  milestoneDate: string;

  @Property()
  @Example("Paris, France")
  location?: string;

  @Property()
  @Example(["Wedding", "Anniversary", "Travel"])
  tags?: string[];

  @Property()
  @Example({ weather: "sunny", guests: 150 })
  metadata?: Record<string, any>;

  @Property()
  @Example(true)
  isActive: boolean;

  @Property()
  @Example(false)
  isPrivate: boolean;

  @Property()
  @Example("Wedding Ceremony")
  occasion?: string;

  @Property()
  @Example("Everything was perfect, from the ceremony to the reception")
  notes?: string;

  @Property()
  @Example([
    {
      id: "file-123",
      fileName: "wedding-photo.jpg",
      originalFileName: "IMG_001.jpg",
      contentType: "image/jpeg",
      fileSize: 2048576,
      s3Key: "user123/milestones/wedding-photo.jpg",
      description: "Main wedding photo",
      tags: "wedding,ceremony",
      createdAt: "2024-06-15T10:00:00Z"
    }
  ])
  files?: {
    id: string;
    fileName: string;
    originalFileName: string;
    contentType?: string;
    fileSize: number;
    s3Key: string;
    description?: string;
    tags?: string;
    createdAt: string;
  }[];

  @Property()
  @Example("2024-06-15T10:00:00Z")
  createdAt: string;

  @Property()
  @Example("2024-06-15T10:00:00Z")
  updatedAt: string;
}

export class MilestoneStatsDto {
  @Property()
  @Example(25)
  totalMilestones: number;

  @Property()
  @Example({
    "Got married": 1,
    Birthday: 5,
    "First Travel": 3,
    Graduation: 2
  })
  milestonesByCategory: Record<string, number>;

  @Property()
  @Example({
    "2024": 8,
    "2023": 12,
    "2022": 5
  })
  milestonesByYear: Record<string, number>;

  @Property()
  @Example([])
  recentMilestones: MilestoneResponseDto[];

  @Property()
  @Example([])
  upcomingMilestones: MilestoneResponseDto[];
}
