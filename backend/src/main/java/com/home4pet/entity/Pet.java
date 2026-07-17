package com.home4pet.entity;

import com.home4pet.enums.Gender;
import com.home4pet.enums.PetSpecies;
import com.home4pet.enums.PetStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pet extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PetSpecies species;

    @Column(length = 100)
    private String breed;

    @Column(nullable = false)
    private Integer age;

    @Column(name = "age_unit", nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'YEARS'")
    @Builder.Default
    private String ageUnit = "YEARS";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PetStatus status = PetStatus.AVAILABLE;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal adoptionFee = BigDecimal.ZERO;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Builder.Default
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PetImage> images = new ArrayList<>();
}
