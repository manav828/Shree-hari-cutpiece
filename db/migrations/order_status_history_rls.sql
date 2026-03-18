-- Enable RLS for order_status_history if not already enabled
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view the status history of their own orders
DROP POLICY IF EXISTS "Users can view their own order status history" ON public.order_status_history;

CREATE POLICY "Users can view their own order status history"
    ON public.order_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_status_history.order_id
            AND orders.user_id = auth.uid()
        )
    );
