<?php

namespace Bltdreeg\Core\Modules\Booking\Exceptions;

use RuntimeException;

/**
 * One exception for every booking refusal. `$errorCode` is the machine-readable
 * string the API returns (spec §7.2), so controllers map it straight into the
 * existing ApiError shape without a translation table.
 */
class BookingException extends RuntimeException
{
    public function __construct(public readonly string $errorCode, string $message)
    {
        parent::__construct($message);
    }

    public static function invalidBasket(string $why): self
    {
        return new self('booking.invalid_basket', $why);
    }

    public static function slotTaken(): self
    {
        return new self('booking.slot_taken', 'That time was just taken.');
    }

    public static function outsideHours(): self
    {
        return new self('booking.outside_hours', "That time is outside the barber's working hours.");
    }

    public static function blocked(): self
    {
        return new self('booking.blocked', 'That time is blocked.');
    }

    public static function tooSoon(): self
    {
        return new self('booking.too_soon', 'That time is too close to now.');
    }

    public static function beyondHorizon(): self
    {
        return new self('booking.beyond_horizon', 'That date is too far ahead.');
    }

    public static function cutoffPassed(): self
    {
        return new self('booking.cutoff_passed', 'It is too late to change this booking.');
    }

    public static function barberPaused(): self
    {
        return new self('booking.barber_paused', 'That barber is not taking bookings.');
    }
}
