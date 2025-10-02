using Microsoft.EntityFrameworkCore;

namespace StdFrase.Api.Data;

public class AppDbContext : DbContext
{
    public DbSet<Flow> Flows => Set<Flow>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Field> Fields => Set<Field>();
    public DbSet<Cuesta> Cuestas => Set<Cuesta>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Flow>(e =>
        {
            e.Property(p => p.Title).IsRequired().HasMaxLength(256);
            e.Property(p => p.Sks).HasMaxLength(50);
        });

        b.Entity<Activity>(e =>
        {
            e.HasOne(a => a.Flow)
             .WithMany(f => f.Activities)
             .HasForeignKey(a => a.FlowId)
             .OnDelete(DeleteBehavior.Cascade);

            e.Property(a => a.Name).IsRequired().HasMaxLength(256);
            e.Property(a => a.MoId).HasMaxLength(256);
            e.HasIndex(a => a.FlowId);
        });

        b.Entity<Field>(e =>
        {
            e.HasOne(f => f.Activity)
             .WithMany(a => a.Fields)
             .HasForeignKey(f => f.ActivityId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(f => f.Cuesta)
             .WithMany()
             .HasForeignKey(f => f.CuestaId)
             .OnDelete(DeleteBehavior.Restrict);

            b.Entity<Cuesta>(e =>
            {
                e.HasKey(c => c.Id); // Explicitly set the primary key
                //e.HasIndex(c => c.Path).IsUnique();
                e.Property(c => c.Path).IsRequired().HasMaxLength(1024);
            });
            e.Property(f => f.StandardPhrase).HasMaxLength(256);
            b.Entity<Cuesta>(e =>
            {
                e.HasKey(c => c.Id); // Explicitly set the primary key
                e.HasIndex(c => c.Path).IsUnique();
                e.Property(c => c.Path).IsRequired().HasMaxLength(1024);
            });
            e.HasIndex(f => f.ActivityId);
            e.HasIndex(f => f.CuestaId);
        });

        b.Entity<Cuesta>(e =>
        {
            e.HasIndex(c => c.Path).IsUnique();
            e.Property(c => c.Path).IsRequired().HasMaxLength(1024);
        });
    }
}