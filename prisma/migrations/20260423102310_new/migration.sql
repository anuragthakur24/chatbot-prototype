-- CreateIndex
CREATE INDEX "ChatLog_empId_idx" ON "ChatLog"("empId");

-- CreateIndex
CREATE INDEX "Ticket_empId_idx" ON "Ticket"("empId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");

-- CreateIndex
CREATE INDEX "Ticket_category_idx" ON "Ticket"("category");
