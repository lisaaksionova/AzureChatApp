using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions opts) : base(opts) { }
        public DbSet<Message> Messages { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
