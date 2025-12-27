import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WalletUtilsService {
  private readonly logger = new Logger(WalletUtilsService.name);

  constructor() {}

  // Converts paisa to rupees in string format
  formatPaiseToRupee = (value?: number | null): string => {
    if (value == null || isNaN(value)) return '₹0.00';

    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);

    // paise → rupees
    const rupees = absoluteValue / 100;

    // Indian number formatting
    const formatted = rupees.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${isNegative ? '-' : ''}₹${formatted}`;
  };
}
