-- CreateTable
CREATE TABLE "GuildSetting" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT,
    "settingName" TEXT,
    "settingValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildSetting_guildId_settingName_key" ON "GuildSetting"("guildId", "settingName");
