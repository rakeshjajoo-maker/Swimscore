-- CreateTable
CREATE TABLE "Swimmer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "squad" TEXT NOT NULL,
    "primaryStroke" TEXT NOT NULL,
    "competitionCategory" TEXT NOT NULL,
    "seasonGoal" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "swimmerId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "sessionType" TEXT NOT NULL,
    "totalMeters" INTEGER NOT NULL DEFAULT 0,
    "preMood" INTEGER,
    "postMood" INTEGER,
    "attended" BOOLEAN NOT NULL DEFAULT true,
    "skipReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_swimmerId_fkey" FOREIGN KEY ("swimmerId") REFERENCES "Swimmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "setType" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "distancePerRep" INTEGER NOT NULL,
    "stroke" TEXT NOT NULL,
    "intervalSeconds" INTEGER,
    "equipment" JSONB,
    "actualTimesSeconds" JSONB,
    "rpe" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Set_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BestTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "swimmerId" TEXT NOT NULL,
    "stroke" TEXT NOT NULL,
    "distance" INTEGER NOT NULL,
    "timeSeconds" REAL NOT NULL,
    "context" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "isPB" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BestTime_swimmerId_fkey" FOREIGN KEY ("swimmerId") REFERENCES "Swimmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "swimmerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "events" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Meet_swimmerId_fkey" FOREIGN KEY ("swimmerId") REFERENCES "Swimmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SwimScoreSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "swimmerId" TEXT NOT NULL,
    "weekStartDate" DATETIME NOT NULL,
    "volumeScore" REAL NOT NULL,
    "consistencyScore" REAL NOT NULL,
    "effortAlignmentScore" REAL NOT NULL,
    "timeTrendScore" REAL NOT NULL,
    "techniqueScore" REAL NOT NULL,
    "compositeScore" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SwimScoreSnapshot_swimmerId_fkey" FOREIGN KEY ("swimmerId") REFERENCES "Swimmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Session_swimmerId_date_idx" ON "Session"("swimmerId", "date");

-- CreateIndex
CREATE INDEX "Set_sessionId_idx" ON "Set"("sessionId");

-- CreateIndex
CREATE INDEX "BestTime_swimmerId_stroke_distance_idx" ON "BestTime"("swimmerId", "stroke", "distance");

-- CreateIndex
CREATE INDEX "Meet_swimmerId_idx" ON "Meet"("swimmerId");

-- CreateIndex
CREATE UNIQUE INDEX "SwimScoreSnapshot_swimmerId_weekStartDate_key" ON "SwimScoreSnapshot"("swimmerId", "weekStartDate");
