import { Service } from "@tsed/di";
import * as bcrypt from "bcrypt";

@Service()
export class PinService {
  private readonly saltRounds = 12; // Higher than password for extra security

  /**
   * Hash a PIN for secure storage
   * @param pin - The plain text PIN (4-6 digits)
   * @returns Hashed PIN
   */
  async hashPin(pin: string): Promise<string> {
    this.validatePin(pin);
    return await bcrypt.hash(pin, this.saltRounds);
  }

  /**
   * Verify a PIN against its hash
   * @param pin - The plain text PIN
   * @param hash - The stored hash
   * @returns True if PIN matches
   */
  async verifyPin(pin: string, hash: string): Promise<boolean> {
    this.validatePin(pin);
    return await bcrypt.compare(pin, hash);
  }

  /**
   * Validate PIN format
   * @param pin - The PIN to validate
   */
  private validatePin(pin: string): void {
    if (!pin) {
      throw new Error("PIN is required");
    }

    // Check if PIN is only digits
    if (!/^\d+$/.test(pin)) {
      throw new Error("PIN must contain only numbers");
    }

    // Check PIN length (4-6 digits)
    if (pin.length < 4 || pin.length > 6) {
      throw new Error("PIN must be between 4 and 6 digits");
    }

    // Check for weak PINs
    const weakPins = [
      "0000",
      "1111",
      "2222",
      "3333",
      "4444",
      "5555",
      "6666",
      "7777",
      "8888",
      "9999",
      "1234",
      "4321",
      "0123",
      "1357",
      "2468",
      "9876",
      "6543"
    ];

    if (weakPins.includes(pin)) {
      throw new Error("PIN is too weak. Please choose a different PIN");
    }
  }

  /**
   * Generate a random PIN (for testing purposes)
   * @returns A random 4-digit PIN
   */
  generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
