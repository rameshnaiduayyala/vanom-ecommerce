-- Ensure every user has at most one cart.
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");
