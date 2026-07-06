# Development Rules: Discord.js v14+ Integration

These rules govern all Discord API and Discord.js v14+ operations. All code changes interacting with Discord must strictly adhere to these rules.

---

## ⏱️ Rule 1: The 3-Second Interaction Window
* **Constraint**: Discord slash commands and interactions (buttons, modals, select menus) expire after **3 seconds** if not acknowledged.
* **Requirements**:
  - If a command performs any asynchronous task (e.g., database lookup, external API call, delay), you **MUST** call `await interaction.deferReply()` or `await interaction.deferReply({ ephemeral: true })` within the first 2 seconds.
  - Subsequent replies must use `await interaction.editReply(...)` or `await interaction.followUp(...)`.
  - Use `Messager.ts` helpers to standardize waiting, success, and error messages.

---

## 🛡️ Rule 2: Robust API Error Handling
* **Constraint**: Any Discord API interaction (e.g., sending messages, adding roles, kicking members) can throw a `DiscordAPIError` due to network issues, rate limits, or missing permissions.
* **Requirements**:
  - Always wrap Discord API calls in `try/catch` blocks.
  - Standardize error responses to the user:
    ```typescript
    try {
      await member.roles.add(role);
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        await Messager.sendAPIError(interaction, error);
      } else {
        await Messager.sendErrorMessage(interaction, "Failed to assign role.");
      }
    }
    ```

---

## 🔒 Rule 3: Explicit Permissions Verification
* **Constraint**: Do not assume the user or the bot has necessary permissions.
* **Requirements**:
  - Commands requiring administrative permissions must use `.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)` in the SlashCommandBuilder.
  - Inside the command execute block, check if the member has the appropriate permissions before executing business logic:
    ```typescript
    const member = <GuildMember>interaction.member;
    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await Messager.sendErrorMessage(interaction, "Missing 'Manage Guild' permissions!");
      return;
    }
    ```

---

## 📁 Rule 4: Gateway Intents & Cache Safeguards
* **Constraint**: Gateway Intents restrict what data Discord sends to the bot. Entity caches might be empty.
* **Requirements**:
  - Do not use cached data directly without fallback fetches. For example, use `await guild.members.fetch(userId)` if a member is not found in `guild.members.cache.get(userId)`.
  - Do not enable unnecessary intents (especially privileged intents like `MessageContent` or `GuildMembers`) unless explicitly required by the bot's core design.
