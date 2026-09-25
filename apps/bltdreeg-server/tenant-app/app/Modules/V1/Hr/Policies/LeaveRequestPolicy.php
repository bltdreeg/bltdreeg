<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Policies;

use Bltdreeg\Core\Modules\Hr\Models\LeaveRequest;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Foundation\Auth\User as AuthUser;

class LeaveRequestPolicy
{
    use HandlesAuthorization;

    public function viewAny(AuthUser $authUser): bool
    {
        return $authUser->can('ViewAny:LeaveRequest');
    }

    /**
     * Employees may open their own request even without the HR view permission;
     * leave reasons are sensitive, so seeing colleagues' is an HR privilege.
     */
    public function view(AuthUser $authUser, LeaveRequest $leaveRequest): bool
    {
        return $this->belongsToRequest($authUser, $leaveRequest)
            || $authUser->can('View:LeaveRequest');
    }

    public function create(AuthUser $authUser): bool
    {
        return $authUser->can('Create:LeaveRequest');
    }

    /**
     * A decided request is a record, not a draft, so it stops being editable.
     */
    public function update(AuthUser $authUser, LeaveRequest $leaveRequest): bool
    {
        return $leaveRequest->isPending()
            && $authUser->can('Update:LeaveRequest');
    }

    public function delete(AuthUser $authUser, LeaveRequest $leaveRequest): bool
    {
        return $authUser->can('Delete:LeaveRequest');
    }

    public function approve(AuthUser $authUser, LeaveRequest $leaveRequest): bool
    {
        return $leaveRequest->isPending()
            && $authUser->can('Approve:LeaveRequest');
    }

    public function reject(AuthUser $authUser, LeaveRequest $leaveRequest): bool
    {
        return $leaveRequest->isPending()
            && $authUser->can('Reject:LeaveRequest');
    }

    /**
     * Whoever filed the request may withdraw it, as long as nobody decided yet.
     */
    public function cancel(AuthUser $authUser, LeaveRequest $leaveRequest): bool
    {
        return $leaveRequest->isPending()
            && ($this->belongsToRequest($authUser, $leaveRequest)
                || $authUser->can('Update:LeaveRequest'));
    }

    private function belongsToRequest(AuthUser $authUser, LeaveRequest $leaveRequest): bool
    {
        return $leaveRequest->user_id === $authUser->getKey();
    }
}
