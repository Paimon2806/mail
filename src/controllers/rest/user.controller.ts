// create a user controller that will be used to create a user and get a user by id

import { Controller } from "@tsed/di";
import { UserService } from "../../services/user.service";
import { ICreateUser, IUser, IUserResponse } from "@/interface/IUser";
import { Delete, Description, Get, Post, Put, Returns, Property } from "@tsed/schema";
import { BodyParams, Context } from "@tsed/platform-params";
import { DecodedIdToken } from "firebase-admin/auth";
import { CustomAuth } from "@/decorators/CustomAuth";
import { ApiResponse, CreateUserDto, UpdateUserDto, SetPinDto, UpdatePinDto, VerifyPinDto } from "../../schemas";
import { FcmTokenRepository } from "../../repositories/fcm-token.repository";

class UpdateFcmTokenDto {
  @Property()
  @Description("Firebase Cloud Messaging token for push notifications")
  fcmToken: string;
}

@Controller("/user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fcmTokenRepository: FcmTokenRepository
  ) {}

  @Post("/")
  @Description("Create a new user")
  @CustomAuth("Create a new user")
  @Returns(201, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(409, ApiResponse)
  @Returns(401, ApiResponse)
  async createUser(
    @BodyParams() userData: CreateUserDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<IUserResponse>> {
    try {
      const newUser = await this.userService.createUser(userData as ICreateUser, auth?.uid as string);
      return new ApiResponse(newUser, "User created successfully");
    } catch (error) {
      throw error; // Let the error handler middleware handle it
    }
  }

  @Get("/me")
  @CustomAuth("Get current user")
  @Description("Get current user")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getCurrentUser(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<IUserResponse | null>> {
    try {
      const user = await this.userService.getUserById(auth?.uid as string);
      if (!user) {
        return new ApiResponse(null, "User not found");
      }
      return new ApiResponse(user, "User retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Put("/me")
  @CustomAuth("Update current user")
  @Description("Update current user")
  @Returns(200, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async updateCurrentUser(
    @BodyParams() userData: UpdateUserDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<IUserResponse | null>> {
    try {
      const updatedUser = await this.userService.updateUser(auth?.uid as string, userData);
      if (!updatedUser) {
        return new ApiResponse(null, "User not found");
      }
      return new ApiResponse(updatedUser, "User updated successfully");
    } catch (error) {
      throw error;
    }
  }

  @Delete("/me")
  @CustomAuth("Delete current user")
  @Description("Delete current user")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async deleteCurrentUser(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<boolean>> {
    try {
      const deleted = await this.userService.deleteUser(auth?.uid as string);
      if (!deleted) {
        return new ApiResponse(false, "User not found or could not be deleted");
      }
      return new ApiResponse(true, "User deleted successfully");
    } catch (error) {
      throw error;
    }
  }

  @Post("/pin/set")
  @CustomAuth("Set user PIN")
  @Description("Set PIN for the current user (first time)")
  @Returns(200, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(409, ApiResponse)
  async setPin(@BodyParams() pinData: SetPinDto, @Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.userService.setUserPin(auth?.uid as string, pinData.pin, auth?.email);
      if (!result) {
        return new ApiResponse(false, "Failed to set PIN");
      }
      return new ApiResponse(true, "PIN set successfully");
    } catch (error) {
      throw error;
    }
  }

  @Put("/pin/update")
  @CustomAuth("Update user PIN")
  @Description("Update PIN for the current user")
  @Returns(200, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(403, ApiResponse)
  async updatePin(
    @BodyParams() pinData: UpdatePinDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.userService.updateUserPin(auth?.uid as string, pinData.currentPin, pinData.newPin);
      if (!result) {
        return new ApiResponse(false, "Failed to update PIN - current PIN is incorrect");
      }
      return new ApiResponse(true, "PIN updated successfully");
    } catch (error) {
      throw error;
    }
  }

  @Post("/pin/verify")
  @CustomAuth("Verify user PIN")
  @Description("Verify PIN for the current user")
  @Returns(200, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(403, ApiResponse)
  async verifyPin(
    @BodyParams() pinData: VerifyPinDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.userService.verifyUserPin(auth?.uid as string, pinData.pin);
      return new ApiResponse(result, result ? "PIN verified successfully" : "Invalid PIN");
    } catch (error) {
      throw error;
    }
  }

  @Post("/fcm-token")
  @CustomAuth("Add FCM token")
  @Description("Add Firebase Cloud Messaging token for push notifications (supports multiple devices)")
  @Returns(201, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async addFcmToken(
    @BodyParams() tokenData: UpdateFcmTokenDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<boolean>> {
    try {
      const user = await this.userService.getUserById(auth?.uid as string);
      if (!user) {
        return new ApiResponse(false, "User not found");
      }

      // Check if token already exists for this user
      const existingToken = await this.fcmTokenRepository.findByUserIdAndToken(user.id, tokenData.fcmToken);
      if (existingToken) {
        return new ApiResponse(true, "FCM token already exists for this user");
      }

      // If token exists for another user, remove it first
      const tokenForOtherUser = await this.fcmTokenRepository.findByToken(tokenData.fcmToken);
      if (tokenForOtherUser) {
        await this.fcmTokenRepository.deleteById(tokenForOtherUser.id);
      }

      // Add new token for current user
      await this.fcmTokenRepository.create({ token: tokenData.fcmToken, userId: user.id });
      return new ApiResponse(true, "FCM token added successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/fcm-tokens")
  @CustomAuth("Get user FCM tokens")
  @Description("Get all FCM tokens for the current user")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getUserFcmTokens(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any[]>> {
    try {
      const user = await this.userService.getUserById(auth?.uid as string);
      if (!user) {
        return new ApiResponse([], "User not found");
      }

      const tokens = await this.fcmTokenRepository.findByUserId(user.id);
      return new ApiResponse(tokens, "FCM tokens retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Delete("/fcm-token")
  @CustomAuth("Delete FCM token")
  @Description("Delete a specific FCM token")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async deleteFcmToken(
    @BodyParams() tokenData: UpdateFcmTokenDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<boolean>> {
    try {
      const user = await this.userService.getUserById(auth?.uid as string);
      if (!user) {
        return new ApiResponse(false, "User not found");
      }

      const result = await this.fcmTokenRepository.deleteByToken(tokenData.fcmToken);
      return new ApiResponse(result, result ? "FCM token deleted successfully" : "FCM token not found");
    } catch (error) {
      throw error;
    }
  }
}
