<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    public const PAYMENT_PENDING = 'Pending';

    public const PAYMENT_PAID = 'Paid';

    public const PAYMENT_FAILED = 'Failed';

    public const PAYMENT_EXPIRED = 'Expired';

    public const STATUS_PENDING_PAYMENT = 'Menunggu Pembayaran';

    public const STATUS_PAID = 'Dibayar';

    public const STATUS_PROCESSING = 'Diproses';

    public const STATUS_SHIPPED = 'Dikirim';

    public const STATUS_COMPLETED = 'Selesai';

    protected $fillable = [
        'user_id',
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'shipping_courier',
        'tracking_number',
        'note',
        'subtotal',
        'total',
        'payment_status',
        'order_status',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'total' => 'float',
    ];

    protected $appends = [
        'timeline_logs',
    ];

    protected static function booted(): void
    {
        static::created(function (Order $order) {
            $order->statusLogs()->create([
                'status' => $order->order_status ?? self::STATUS_PENDING_PAYMENT,
                'description' => 'Pesanan berhasil dibuat oleh pelanggan.',
            ]);
        });

        static::updating(function (Order $order) {
            if ($order->isDirty('order_status')) {
                $newStatus = $order->order_status;
                $desc = match ($newStatus) {
                    self::STATUS_PAID => 'Pembayaran pesanan telah berhasil diverifikasi.',
                    self::STATUS_PROCESSING => 'Pesanan sedang dipersiapkan dan dilakukan Quality Control (QC).',
                    self::STATUS_SHIPPED => 'Pesanan telah diserahkan ke kurir pengiriman'.($order->shipping_courier ? " ({$order->shipping_courier}".($order->tracking_number ? ", No. Resi: {$order->tracking_number}" : '').')' : '.'),
                    self::STATUS_COMPLETED => 'Pesanan telah diterima oleh pelanggan dan transaksi selesai.',
                    default => "Status pesanan diperbarui menjadi {$newStatus}.",
                };

                $order->statusLogs()->create([
                    'status' => $newStatus,
                    'description' => $desc,
                ]);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class)->orderBy('created_at', 'asc');
    }

    public function getTimelineLogsAttribute(): array
    {
        $logs = $this->statusLogs;

        if ($logs->isNotEmpty()) {
            return $logs->toArray();
        }

        $fallback = [];
        $fallback[] = [
            'status' => self::STATUS_PENDING_PAYMENT,
            'description' => 'Pesanan berhasil dibuat oleh pelanggan.',
            'created_at' => $this->created_at?->toISOString() ?? now()->toISOString(),
        ];

        if ($this->latestPayment?->paid_at || in_array($this->order_status, [self::STATUS_PAID, self::STATUS_PROCESSING, self::STATUS_SHIPPED, self::STATUS_COMPLETED])) {
            $fallback[] = [
                'status' => self::STATUS_PAID,
                'description' => 'Pembayaran pesanan telah berhasil diverifikasi.',
                'created_at' => $this->latestPayment?->paid_at ? \Carbon\Carbon::parse($this->latestPayment->paid_at)->toISOString() : ($this->created_at?->toISOString() ?? now()->toISOString()),
            ];
        }

        if (in_array($this->order_status, [self::STATUS_PROCESSING, self::STATUS_SHIPPED, self::STATUS_COMPLETED])) {
            $fallback[] = [
                'status' => self::STATUS_PROCESSING,
                'description' => 'Pesanan sedang dipersiapkan dan dilakukan Quality Control (QC).',
                'created_at' => $this->updated_at?->toISOString() ?? now()->toISOString(),
            ];
        }

        if (in_array($this->order_status, [self::STATUS_SHIPPED, self::STATUS_COMPLETED])) {
            $fallback[] = [
                'status' => self::STATUS_SHIPPED,
                'description' => 'Pesanan telah diserahkan ke kurir pengiriman'.($this->shipping_courier ? " ({$this->shipping_courier}".($this->tracking_number ? ", No. Resi: {$this->tracking_number}" : '').')' : '.'),
                'created_at' => $this->updated_at?->toISOString() ?? now()->toISOString(),
            ];
        }

        if ($this->order_status === self::STATUS_COMPLETED) {
            $fallback[] = [
                'status' => self::STATUS_COMPLETED,
                'description' => 'Pesanan telah diterima oleh pelanggan dan transaksi selesai.',
                'created_at' => $this->updated_at?->toISOString() ?? now()->toISOString(),
            ];
        }

        return $fallback;
    }
}
