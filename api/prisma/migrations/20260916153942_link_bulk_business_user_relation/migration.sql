-- AddForeignKey
ALTER TABLE "BulkBusinessUser" ADD CONSTRAINT "BulkBusinessUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
