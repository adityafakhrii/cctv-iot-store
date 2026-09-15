<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ServiceRequest::query();

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->input('service_type')) {
            $query->where('service_type', $type);
        }

        $requests = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/service-requests/index', [
            'requests' => $requests,
            'filters' => [
                'q' => $request->input('q', ''),
                'status' => $request->input('status', ''),
                'service_type' => $request->input('service_type', ''),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'service_type' => ['required', 'string', 'in:Instalasi,Survey,Maintenance'],
            'location' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string', 'max:2000'],
            'note' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'string', 'in:Baru,Diproses,Selesai'],
        ]);

        $user = \App\Models\User::where('email', $validated['email'])->first();

        ServiceRequest::create([
            'user_id' => $user?->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'service_type' => $validated['service_type'],
            'location' => $validated['location'],
            'description' => $validated['description'],
            'note' => $validated['note'] ?? null,
            'status' => $validated['status'] ?? ServiceRequest::STATUS_NEW,
        ]);

        return back()->with('success', 'Pengajuan layanan baru berhasil ditambahkan.');
    }

    public function updateStatus(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Baru,Diproses,Selesai'],
        ]);

        $serviceRequest->update([
            'status' => $validated['status'],
        ]);

        return back()->with('success', "Status pengajuan layanan berhasil diubah menjadi '{$validated['status']}'.");
    }

    public function destroy(ServiceRequest $serviceRequest): RedirectResponse
    {
        $serviceRequest->delete();

        return back()->with('success', 'Pengajuan layanan berhasil dihapus.');
    }
}
