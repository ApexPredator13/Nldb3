using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Admin;

namespace Website.Services
{
    public interface IEditSubmissionRepository
    {
        Task<int> UpdateGameplayEventType(UpdateGameplayEventType updateGameplayEventType);
        Task<int> IncrementActionNumberAfterEventWithId(IncrementActionNumberAfterEventWithId incrementActionNumberAfterEventWithId);
        Task<int> IncrementActionNumberAfterEventWithId(int submissionId, int eventId, int incrementByAmount = 1);
        Task<int> UpdateGameplayEventPlayer(UpdateGameplayEventPlayer updateGameplayEventPlayer);
        Task<int> UpdateGameplayEventWasRerolled(UpdateGameplayEventWasRerolled updateGameplayEventWasRerolled);
        Task<int> InsertGameplayEventAfterEvent(InsertGameplayEvent insertEvent);
        Task<int> DeleteGameplayEvent(DeleteGameplayEvent deleteGameplayEvent);
        Task<int> DeleteSubmission(int submissionId);
    }
}
