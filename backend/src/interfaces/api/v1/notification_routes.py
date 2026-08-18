# ============================================================================
# Notification API Routes
# ============================================================================

"""
Notification API routes for version 1.
"""

from typing import List, Optional
from fastapi import APIRouter, Request, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse

from src.interfaces.schemas import (
    NotificationCreateRequest,
    NotificationUpdateRequest,
    NotificationResponse,
    NotificationListResponse,
    NotificationPreferencesRequest,
    NotificationPreferencesResponse,
    NotificationMarkReadRequest,
    NotificationBulkActionRequest,
    NotificationStatsResponse
)
from src.interfaces.dependencies import get_notification_service
from src.application.services.notification_service import NotificationService
from src.infrastructure.message_bus import MessageBus

router = APIRouter(prefix="/notifications", tags=["notifications"])


# ============================================================================
# Notification Routes
# ============================================================================

@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    notification_type: Optional[str] = Query(None, description="Filter by notification type"),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Get all notifications with pagination and optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Number of records to return
        is_read: Filter by read status
        user_id: Filter by user ID
        notification_type: Filter by notification type
        notification_service: Notification service
        
    Returns:
        NotificationListResponse: List of notifications with pagination metadata
    """
    try:
        notifications, total = await notification_service.get_all_notifications(
            skip=skip,
            limit=limit,
            is_read=is_read,
            user_id=user_id,
            notification_type=notification_type
        )
        
        return NotificationListResponse(
            items=notifications,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notifications"
        )


@router.get("/user/{user_id}", response_model=NotificationListResponse)
async def get_user_notifications(
    user_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Get all notifications for a specific user.
    
    Args:
        user_id: User ID
        skip: Number of records to skip
        limit: Number of records to return
        is_read: Filter by read status
        notification_service: Notification service
        
    Returns:
        NotificationListResponse: List of user notifications with pagination metadata
    """
    try:
        notifications, total = await notification_service.get_user_notifications(
            user_id=user_id,
            skip=skip,
            limit=limit,
            is_read=is_read
        )
        
        return NotificationListResponse(
            items=notifications,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user notifications"
        )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Get a specific notification by ID.
    
    Args:
        notification_id: Notification ID
        notification_service: Notification service
        
    Returns:
        NotificationResponse: Notification details
    """
    try:
        notification = await notification_service.get_notification_by_id(notification_id)
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} not found"
            )
        
        return notification
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification"
        )


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    request: Request,
    notification_data: NotificationCreateRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Create a new notification.
    
    Args:
        request: HTTP request
        notification_data: Notification creation data
        notification_service: Notification service
        
    Returns:
        NotificationResponse: Created notification details
    """
    try:
        notification = await notification_service.create_notification(notification_data)
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create notification"
            )
        
        return notification
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification"
        )


@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int,
    notification_data: NotificationUpdateRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Update an existing notification.
    
    Args:
        notification_id: Notification ID
        notification_data: Notification update data
        notification_service: Notification service
        
    Returns:
        NotificationResponse: Updated notification details
    """
    try:
        notification = await notification_service.update_notification(
            notification_id=notification_id,
            notification_data=notification_data
        )
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} not found"
            )
        
        return notification
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification"
        )


@router.patch("/{notification_id}", response_model=NotificationResponse)
async def partial_update_notification(
    notification_id: int,
    notification_data: NotificationUpdateRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Partially update an existing notification.
    
    Args:
        notification_id: Notification ID
        notification_data: Notification update data (partial)
        notification_service: Notification service
        
    Returns:
        NotificationResponse: Updated notification details
    """
    try:
        notification = await notification_service.partial_update_notification(
            notification_id=notification_id,
            notification_data=notification_data
        )
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} not found"
            )
        
        return notification
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification"
        )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Delete a notification.
    
    Args:
        notification_id: Notification ID
        notification_service: Notification service
        
    Returns:
        None: 204 No Content on success
    """
    try:
        deleted = await notification_service.delete_notification(notification_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} not found"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )


@router.post("/{notification_id}/mark-read")
async def mark_notification_as_read(
    notification_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Mark a notification as read.
    
    Args:
        notification_id: Notification ID
        notification_service: Notification service
        
    Returns:
        JSONResponse: Mark as read confirmation
    """
    try:
        result = await notification_service.mark_as_read(notification_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} not found"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Notification marked as read",
                "notification_id": notification_id
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )


@router.post("/{notification_id}/mark-unread")
async def mark_notification_as_unread(
    notification_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Mark a notification as unread.
    
    Args:
        notification_id: Notification ID
        notification_service: Notification service
        
    Returns:
        JSONResponse: Mark as unread confirmation
    """
    try:
        result = await notification_service.mark_as_unread(notification_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} not found"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Notification marked as unread",
                "notification_id": notification_id
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as unread"
        )


@router.post("/mark-read/bulk")
async def mark_notifications_as_read_bulk(
    request: NotificationBulkActionRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Mark multiple notifications as read.
    
    Args:
        request: Bulk action request with notification IDs
        notification_service: Notification service
        
    Returns:
        JSONResponse: Bulk operation result
    """
    try:
        result = await notification_service.mark_multiple_as_read(
            notification_ids=request.notification_ids
        )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": f"{result['updated_count']} notifications marked as read",
                "total_requested": len(request.notification_ids),
                "updated_count": result['updated_count'],
                "failed_ids": result.get('failed_ids', [])
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read"
        )


@router.post("/mark-unread/bulk")
async def mark_notifications_as_unread_bulk(
    request: NotificationBulkActionRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Mark multiple notifications as unread.
    
    Args:
        request: Bulk action request with notification IDs
        notification_service: Notification service
        
    Returns:
        JSONResponse: Bulk operation result
    """
    try:
        result = await notification_service.mark_multiple_as_unread(
            notification_ids=request.notification_ids
        )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": f"{result['updated_count']} notifications marked as unread",
                "total_requested": len(request.notification_ids),
                "updated_count": result['updated_count'],
                "failed_ids": result.get('failed_ids', [])
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as unread"
        )


@router.delete("/delete/bulk")
async def delete_notifications_bulk(
    request: NotificationBulkActionRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Delete multiple notifications.
    
    Args:
        request: Bulk action request with notification IDs
        notification_service: Notification service
        
    Returns:
        JSONResponse: Bulk delete result
    """
    try:
        result = await notification_service.delete_multiple_notifications(
            notification_ids=request.notification_ids
        )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": f"{result['deleted_count']} notifications deleted",
                "total_requested": len(request.notification_ids),
                "deleted_count": result['deleted_count'],
                "failed_ids": result.get('failed_ids', [])
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notifications"
        )


# ============================================================================
# Notification Preferences Routes
# ============================================================================

@router.get("/preferences/{user_id}", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    user_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Get notification preferences for a user.
    
    Args:
        user_id: User ID
        notification_service: Notification service
        
    Returns:
        NotificationPreferencesResponse: User notification preferences
    """
    try:
        preferences = await notification_service.get_user_preferences(user_id)
        
        if not preferences:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification preferences not found for user {user_id}"
            )
        
        return preferences
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification preferences"
        )


@router.post("/preferences", response_model=NotificationPreferencesResponse)
async def set_notification_preferences(
    request: Request,
    preferences_data: NotificationPreferencesRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Set or update notification preferences for a user.
    
    Args:
        request: HTTP request
        preferences_data: Notification preferences data
        notification_service: Notification service
        
    Returns:
        NotificationPreferencesResponse: Updated notification preferences
    """
    try:
        preferences = await notification_service.set_user_preferences(
            user_id=preferences_data.user_id,
            preferences=preferences_data
        )
        
        if not preferences:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to set notification preferences"
            )
        
        return preferences
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set notification preferences"
        )


@router.put("/preferences/{user_id}", response_model=NotificationPreferencesResponse)
async def update_notification_preferences(
    user_id: int,
    preferences_data: NotificationPreferencesRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Update notification preferences for a user.
    
    Args:
        user_id: User ID
        preferences_data: Notification preferences data
        notification_service: Notification service
        
    Returns:
        NotificationPreferencesResponse: Updated notification preferences
    """
    try:
        preferences = await notification_service.update_user_preferences(
            user_id=user_id,
            preferences_data=preferences_data
        )
        
        if not preferences:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification preferences not found for user {user_id}"
            )
        
        return preferences
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences"
        )


# ============================================================================
# Notification Statistics Routes
# ============================================================================

@router.get("/stats/user/{user_id}", response_model=NotificationStatsResponse)
async def get_user_notification_stats(
    user_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Get notification statistics for a user.
    
    Args:
        user_id: User ID
        notification_service: Notification service
        
    Returns:
        NotificationStatsResponse: User notification statistics
    """
    try:
        stats = await notification_service.get_user_stats(user_id)
        
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification statistics not found for user {user_id}"
            )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification statistics"
        )


@router.get("/stats/summary")
async def get_notification_summary(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Get overall notification summary.
    
    Args:
        start_date: Start date for summary
        end_date: End date for summary
        notification_service: Notification service
        
    Returns:
        JSONResponse: Notification summary statistics
    """
    try:
        summary = await notification_service.get_summary_stats(
            start_date=start_date,
            end_date=end_date
        )
        
        return JSONResponse(
            content={
                "status": "success",
                "summary": summary
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification summary"
        )


# ============================================================================
# Notification Delivery Routes
# ============================================================================

@router.post("/send")
async def send_notification(
    request: Request,
    notification_data: NotificationCreateRequest,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Send a notification to a user.
    
    Args:
        request: HTTP request
        notification_data: Notification creation data
        notification_service: Notification service
        
    Returns:
        JSONResponse: Send notification result
    """
    try:
        result = await notification_service.send_notification(notification_data)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to send notification"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Notification sent successfully",
                "notification_id": result.get("notification_id"),
                "delivery_status": result.get("delivery_status", {})
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notification"
        )


@router.post("/send/bulk")
async def send_bulk_notifications(
    request: Request,
    notifications_data: List[NotificationCreateRequest],
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Send multiple notifications in bulk.
    
    Args:
        request: HTTP request
        notifications_data: List of notification creation data
        notification_service: Notification service
        
    Returns:
        JSONResponse: Bulk send result
    """
    try:
        if not notifications_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No notifications provided for bulk send"
            )
        
        result = await notification_service.send_bulk_notifications(notifications_data)
        
        return JSONResponse(
            content={
                "status": "success",
                "message": f"{result['sent_count']} notifications sent",
                "total_requested": len(notifications_data),
                "sent_count": result['sent_count'],
                "failed": result.get('failed', [])
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send bulk notifications"
        )


@router.get("/delivery-status/{notification_id}")
async def get_notification_delivery_status(
    notification_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Get delivery status for a notification.
    
    Args:
        notification_id: Notification ID
        notification_service: Notification service
        
    Returns:
        JSONResponse: Notification delivery status
    """
    try:
        status = await notification_service.get_delivery_status(notification_id)
        
        if not status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Delivery status not found for notification {notification_id}"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "notification_id": notification_id,
                "delivery_status": status
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve delivery status"
        )


# ============================================================================
# Real-time Notification Routes
# ============================================================================

@router.get("/realtime/unread-count/{user_id}")
async def get_unread_notification_count(
    user_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Get unread notification count for a user.
    
    Args:
        user_id: User ID
        notification_service: Notification service
        
    Returns:
        JSONResponse: Unread notification count
    """
    try:
        count = await notification_service.get_unread_count(user_id)
        
        return JSONResponse(
            content={
                "status": "success",
                "user_id": user_id,
                "unread_count": count
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve unread notification count"
        )


@router.post("/realtime/mark-all-read/{user_id}")
async def mark_all_user_notifications_as_read(
    user_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Mark all notifications for a user as read.
    
    Args:
        user_id: User ID
        notification_service: Notification service
        
    Returns:
        JSONResponse: Mark all read confirmation
    """
    try:
        result = await notification_service.mark_all_as_read(user_id)
        
        return JSONResponse(
            content={
                "status": "success",
                "message": f"All notifications marked as read for user {user_id}",
                "user_id": user_id,
                "updated_count": result.get("updated_count", 0)
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark all notifications as read"
        )


@router.post("/realtime/clear-all/{user_id}")
async def clear_all_user_notifications(
    user_id: int,
    notification_service: NotificationService = Depends(get_notification_service),
):
    """
    Clear all notifications for a user (delete all).
    
    Args:
        user_id: User ID
        notification_service: Notification service
        
    Returns:
        JSONResponse: Clear all confirmation
    """
    try:
        result = await notification_service.clear_all_notifications(user_id)
        
        return JSONResponse(
            content={
                "status": "success",
                "message": f"All notifications cleared for user {user_id}",
                "user_id": user_id,
                "deleted_count": result.get("deleted_count", 0)
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear all notifications"
        )